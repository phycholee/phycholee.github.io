---
layout: post
title:  "spring-data-redis使用"
subtitle:  "spring-data-redis"
date:   2018-07-06 10:20:00 +0800
author: PhychoLee
categories: [spring,database]
header-img:
---

# spring-data-redis

Spring提供了spring-data-redis对Jedis、lettuce进行封装，提供了一些操作Redis数据库的接口。同时提供了spring-boot-starter-data-redis包，在SpringBoot项目中使用会更加方便。本文会对spring-data-redis的基本使用进行简单的介绍，重点会放在@Cacheable修改序列化方式上。

## 基本使用

本项目基于SpringBoot 2.0.0.RELEASE，spring-boot-starter-data-redis的2.0底层是基于lettuce的。首先加入依赖

	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-data-redis</artifactId>
	</dependency>

	<!-- 后面使用fastjson序列化 -->
	<dependency>
		<groupId>com.alibaba</groupId>
		<artifactId>fastjson</artifactId>
		<version>1.2.47</version>
	</dependency>

	<!-- 压力测试工具 -->
	<dependency>
		<groupId>org.databene</groupId>
		<artifactId>contiperf</artifactId>
		<version>2.3.4</version>
		<scope>test</scope>
	</dependency>

在application.properties中加入配置，这里只写基本的几个配置

	spring.redis.host=127.0.0.1
	spring.redis.port=6379
	spring.redis.password=
	# 连接超时时间（毫秒）
	spring.redis.timeout=10000
	# Redis默认情况下有16个分片，这里配置具体使用的分片，默认是0
	spring.redis.database=0

然后，redis就可以在项目中使用了，默认有两个bean实现，只需@Autowired即可

	@Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private RedisTemplate redisTemplate;


stringRedisTemplate操作String字符串结构

	stringRedisTemplate.boundValueOps(key).set(value);

	stringRedisTemplate.boundValueOps(key).get();

redisTemplate可操作包括String的其他数据结构

	redisTemplate.boundValueOps(key).set(value);//string
    redisTemplate.boundListOps(key).leftPush(value);//list
    redisTemplate.boundSetOps(key).add(value);//set
    redisTemplate.boundZSetOps(key).add(value, 1);//zset
    redisTemplate.boundHashOps(key).put(field, value);//hash


## 序列化方式

stringRedisTemplate会默认使用StringRedisSerializer，但redisTemplate默认使用的是JdkSerializationRedisSerializer，在Redis中查看数据会显示如下，不适合数据查看，因此需要换一种序列化方式。

![](http://osjs7p1js.bkt.clouddn.com/jdkserialization.png)


下面把redisTemplate的key的序列化方式设置为StringRedisSerializer，value的序列化方式设置为FastJsonRedisSerializer。

	/**
     * 设置redisTemplate序列化方式
     * @param redisConnectionFactory
     * @return
     */
	@Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
 		com.alibaba.fastjson.support.spring.FastJsonRedisSerializer<Object> fastJsonRedisSerializer =
                new com.alibaba.fastjson.support.spring.FastJsonRedisSerializer<>(Object.class);

        StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();

        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        template.setKeySerializer(stringRedisSerializer);
        template.setHashKeySerializer(stringRedisSerializer);
        template.setValueSerializer(fastJsonRedisSerializer);
        template.setHashValueSerializer(fastJsonRedisSerializer);
        template.afterPropertiesSet();
        return template;
    }

修改后，显示为

![](http://osjs7p1js.bkt.clouddn.com/fastjsonserialization.png)

## 缓存

通常我们自己使用Redis做缓存，需要自己判断是否有缓存，没有再设置缓存，然后需要在更新的时候将缓存修改或者删除，如下：

	@Override
    public Activity get(Integer id) {
        String key = "activity::" + id;
        String value = redisService.get(key);

        Activity activity = null;
        if (!StringUtils.isEmpty(value)){
            activity = JSON.parseObject(value, Activity.class);
        }
        
        if (activity == null){
            activity = activityMapper.selectByPrimaryKey(id);
			if (activity != null){
                redisService.set(key, JSON.toJSONString(activity));
            }
        }

        return activity;
    }

这种代码会在各个业务层中使用，有很大的通用性，写的时候通常会直接复制代码，可能会未修改key导致bug。

spring-data-redis提供了@Cacheable等注解帮助我们去实现缓存功能。

@Cacheable会根据**返回的值**进行缓存，如果缓存有数据，就不执行方法主体，一般放在查询方法上。

@CachePut会根据**返回的值**进行缓存，不同的是，方法主体一定会执行，一般放在新增和修改方法上。

@CacheEvict对缓存进行清除，一般放在修改或删除方法上。

	@Override
    @Cacheable(value = "activity", key = "#id")
    public Activity get(Integer id) {
        return activityMapper.selectByPrimaryKey(id);
    }

    @Override
    @CachePut(value = "activity", key = "#activity.id")
    public Activity save(Activity activity) {
        int result = activityMapper.insertSelective(activity);
        if (result > 0) {
            return activity;
        }
        return null;
    }

    @Override
    @CachePut(value = "activity", key = "#activity.id")
    public Activity update(Activity activity) {
        int result = activityMapper.updateByPrimaryKeySelective(activity);
        if (result > 0) {
            return activity;
        }
        return null;
    }

    @Override
    @CacheEvict(value = "activity", key = "#id")
    public int delete(Integer id) {
        return activityMapper.deleteByPrimaryKey(id);
    }

**缓存穿透**

@Cacheable会对null值设置一个特殊的值，防止缓存穿透

![](http://osjs7p1js.bkt.clouddn.com/cachepenetration.png)


缓存一般是针对热点数据，上面在新增和保存的方法中使用@CachePut会把所有数据都放到缓存中，并且没有失效处理。另一种方案是在修改或删除的时候删除数据，只有在取数据的时候才做加入缓存处理。

将新增、修改和删除都进行删除缓存处理。新增也加入缓存删除是@Cacheable会把不存在的值做特殊缓存处理，如果新增的键已经在缓存，需要删除。

	@Override
    @Cacheable(value = "activity", key = "#id")
    public Activity get(Integer id) {
        return activityMapper.selectByPrimaryKey(id);
    }

    @Override
    @CacheEvict(value = "activity", key = "#activity.id")
    public Activity save(Activity activity) {
        int result = activityMapper.insertSelective(activity);
        if (result > 0) {
            return activity;
        }
        return null;
    }

    @Override
    @CacheEvict(value = "activity", key = "#activity.id")
    public Activity update(Activity activity) {
        int result = activityMapper.updateByPrimaryKeySelective(activity);
        if (result > 0) {
            return activity;
        }
        return null;
    }

    @Override
    @CacheEvict(value = "activity", key = "#id")
    public int delete(Integer id) {
        return activityMapper.deleteByPrimaryKey(id);
    }

**序列化**

使用@Cacheable存储的数据不使用redisTemplate，所以上面设置的序列化方式对其无效。上面缓存会使用默认的序列化方式。

![](http://osjs7p1js.bkt.clouddn.com/jdkserializationcache.png)

那么就要单独对其设置序列化方式，同时设置过期时间

	/**
     * 设置 @Cacheable 序列化方式
     * 设置过期时间为1天
     * @return
     */
    @Bean
    public RedisCacheConfiguration redisCacheConfiguration(){
        FastJsonRedisSerializer<Object> serializer = new FastJsonRedisSerializer<>(Object.class);

        RedisCacheConfiguration configuration = RedisCacheConfiguration.defaultCacheConfig();
        configuration = configuration.serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer)).entryTtl(Duration.ofDays(1));
        return configuration;
    }

第一次获取走数据库，同时将设置缓存，缓存数据为json格式。

![](http://osjs7p1js.bkt.clouddn.com/fastjsonserialnotype.png)

但第二次获取的时候就报错ClassCastException

![](http://osjs7p1js.bkt.clouddn.com/classcastexception.png)

经过排查，是使用FastJsonRedisSerializer不能反序列化为Activity。

![](http://osjs7p1js.bkt.clouddn.com/fastjsonredisserializer.png)


重写了一个FastJsonRedisSerializer，不同在于序列化的时候把className也一并写进去。

	package com.llf.demo.config;

	import com.alibaba.fastjson.JSON;
	import com.alibaba.fastjson.serializer.SerializerFeature;
	import org.springframework.data.redis.serializer.RedisSerializer;
	import org.springframework.data.redis.serializer.SerializationException;
	
	import java.nio.charset.Charset;
	
	/**
	 * @author: Oliver.li
	 * @Description: 重写FastJsonRedisSerializer，能够反序列化为正确的Java类型
	 * @date: 2018/7/5 16:10
	 */
	public class FastJsonRedisSerializer<T> implements RedisSerializer<T> {

	    public static final Charset DEFAULT_CHARSET = Charset.forName("UTF-8");
	
	    private Class<T> clazz;
	
	    public FastJsonRedisSerializer(Class<T> clazz) {
	        super();
	        this.clazz = clazz;
	    }
	
	    @Override
	    public byte[] serialize(T t) throws SerializationException {
	        if (t == null) {
	            return new byte[0];
	        }
	        return JSON.toJSONString(t, SerializerFeature.WriteClassName).getBytes(DEFAULT_CHARSET);
	    }
	
	    @Override
	    public T deserialize(byte[] bytes) throws SerializationException {
	        if (bytes == null || bytes.length <= 0) {
	            return null;
	        }
	        String str = new String(bytes, DEFAULT_CHARSET);
	        return JSON.parseObject(str, clazz);
	    }
	}

此时，结果会多出一个@type字段。

![](http://osjs7p1js.bkt.clouddn.com/fastjsonserialwithtype.png)


但第二次访问的时候会还是会报错，这次是JSONException.

![](http://osjs7p1js.bkt.clouddn.com/autotypenotsupport.png)


查询fastjson得知，在1.2.25之后的版本，autotype功能是受限的。需要打开白名单功能。

fastjson文档: [https://github.com/alibaba/fastjson/wiki/enable_autotype](https://github.com/alibaba/fastjson/wiki/enable_autotype)

将上面的配置改为如下：

	@Bean
    public RedisCacheConfiguration redisCacheConfiguration(){
        FastJsonRedisSerializer<Object> serializer = new FastJsonRedisSerializer<>(Object.class);
        ParserConfig parserConfig = ParserConfig.getGlobalInstance();
        parserConfig.addAccept("com.llf.demo.");//项目中需要序列化的包
        parserConfig.addAccept("com.github.pagehelper.");//其他需要序列化的包

        RedisCacheConfiguration configuration = RedisCacheConfiguration.defaultCacheConfig();
        configuration = configuration.serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer)).entryTtl(Duration.ofDays(1));
        return configuration;
    }

加入此配置后就大功告成啦！


## 项目源代码

[https://github.com/phycholee/phycholee.github.io](https://github.com/phycholee/phycholee.github.io)