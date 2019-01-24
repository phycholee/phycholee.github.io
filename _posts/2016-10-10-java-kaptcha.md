---
layout: post
title:  "Java验证码Kaptcha"
subtitle:  "Java Kaptcha"
date:   2016-10-10 17:45:32 +0800
author: PhychoLee
categories: java
header-img:
---

## Kaptcha使用

Kaptcha是Java生成验证码框架，功能强大，使用简单。在一个项目中与shiro结合使用进行登录验证，以下是简单的使用手册。

### 导入jar包

可到[https://code.google.com/archive/p/kaptcha/downloads](https://code.google.com/archive/p/kaptcha/downloads)下载jar包

如果是maven项目，加入以下依赖

{% highlight ruby %}

    <!-- kaptcha -->  
    <dependency>  
        <groupId>com.google.code.kaptcha</groupId>  
        <artifactId>kaptcha</artifactId>  
        <version>2.3.2</version>
    </dependency>

{% endhighlight %}

### 配置web.xml

在web.xml中=加入以下配置

{% highlight ruby %}

	<!--kaptcha-->
    <servlet>
        <servlet-name>Kaptcha</servlet-name>
        <servlet-class>
            com.google.code.kaptcha.servlet.KaptchaServlet
        </servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>Kaptcha</servlet-name>
        <url-pattern>/kaptcha.jpg</url-pattern>
    </servlet-mapping>

{% endhighlight %}

如果不与Spring集成，要加入配置项

{% highlight ruby %}

	<init-param>
        <description>图片边框，合法值：yes , no</description>
        <param-name>kaptcha.border</param-name>
        <param-value>yes</param-value>
    </init-param>

{% endhighlight %}

详细配置在下文

### 与Spring集成

在Spring配置文件applicationContext.xml中加入kaptcha的bean

{% highlight ruby %}

    <!--kaptcha验证码-->
        <bean id="captchaProducer" class="com.google.code.kaptcha.impl.DefaultKaptcha">
            <property name="config">
                <bean class="com.google.code.kaptcha.util.Config">
                    <constructor-arg>
                        <props>
                            <prop key="kaptcha.border">no</prop>
                            <prop key="kaptcha.border.color">105,179,90</prop>
                            <prop key="kaptcha.textproducer.font.color">black</prop>
                            <prop key="kaptcha.image.width">96</prop>
                            <prop key="kaptcha.image.height">38</prop>
                            <prop key="kaptcha.textproducer.font.size">30</prop>
                            <prop key="kaptcha.session.key">code</prop>
                            <prop key="kaptcha.textproducer.char.length">4</prop>
                            <prop key="kaptcha.textproducer.char.string">abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ</prop>
                            <prop key="kaptcha.textproducer.font.names">Arial,宋体,楷体,微软雅黑</prop>
                            <prop key="kaptcha.noise.impl">com.google.code.kaptcha.impl.DefaultNoise</prop>
                            <prop key="kaptcha.noise.color">green</prop>
                            <prop key="kaptcha.obscurificator.impl">com.google.code.kaptcha.impl.ShadowGimpy</prop>
                        </props>
                    </constructor-arg>
                </bean>
            </property>
        </bean>

{% endhighlight %}

### 获取验证码图片的Controller方法

创建一个SpringMVC的Controller方法，用来获取验证码图片

{% highlight ruby %}

    @Controller
    @RequestMapping("/code")
    public class CaptchaAction {

        @Autowired
        private Producer captchaProducer;

        @RequestMapping(value = "captcha-image")
        public ModelAndView getKaptchaImage(HttpServletRequest request, HttpServletResponse response) throws Exception {
            HttpSession session = request.getSession();
            String code = (String)session.getAttribute(Constants.KAPTCHA_SESSION_KEY);

            response.setDateHeader("Expires", 0);
            response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
            response.addHeader("Cache-Control", "post-check=0, pre-check=0");
            response.setHeader("Pragma", "no-cache");
            response.setContentType("image/jpeg");

            String capText = captchaProducer.createText();

            //将生成的验证码保存到session中
            session.setAttribute(Constants.KAPTCHA_SESSION_KEY, capText);

            BufferedImage bi = captchaProducer.createImage(capText);
            ServletOutputStream out = response.getOutputStream();
            ImageIO.write(bi, "jpg", out);
            try {
                out.flush();
            } finally {
                out.close();
            }
            return null;
        }
    }

{% endhighlight %}

### 前台HTML

在前台需要验证码的地方加入img图片，src设置为controller方法路径

{% highlight ruby %}

	<input id="captcha-input" type="text" class="form-control" name="kaptchafield" value="" placeholder="请输入验证码"/>
	<img src="${ctx}/code/captcha-image" mce_src="Kaptcha.jpg" id="kaptchaImage" title="点击换一张"/>
    //js代码，点击换一张图片
    $(function () {
        $('#kaptchaImage').on('click', function() {
            $(this).hide().attr('src', 'code/captcha-image?' + Math.floor(Math.random()*100) ).fadeIn();
        });
    });

{% endhighlight %}

### 验证

在用户提交验证码后进行验证

{% highlight ruby %}

	//获取Session中保存的正确的验证码
    String capText = (String) httpServletRequest.getSession()
                    .getAttribute(Constants.KAPTCHA_SESSION_KEY);
    //获取用户提交的验证码
    String inputCodeParm = (String) httpServletRequest.getParameter("kaptchafield");

            System.out.println(capText);
            if (capText != null && inputCodeParm != null){
                if (capText.equalsIgnoreCase(inputCodeParm)){
                    //验证码正确...

                }
            }

{% endhighlight %}

最后效果图
![验证码](/assets/posts_img/20160805/captcha-image.jpeg)

### Kaptcha配置项

按照Spring的配置

	图片边框，合法值：yes , no
	<prop key="kaptcha.border">yes</prop>

	边框颜色，合法值： r,g,b 或者white,black,blue.
	<prop key="kaptcha.border.color">blue</prop>

	边框厚度，合法值：>0
	<prop key="kaptcha.border.thickness">1</prop>

	图片宽度
	<prop key="kaptcha.image.width">200</prop>

	图片高度
    <prop key="kaptcha.image.height">50</prop>

	图片实现类
	<prop key="kaptcha.producer.impl">com.google.code.kaptcha.impl.DefaultKaptcha</prop>

	文本实现类
	<prop key="kaptcha.textproducer.impl">com.google.code.kaptcha.text.impl.DefaultTextCreator</prop>

	文本集合，默认为abcde2345678gfynmnpwx
	<prop key="kaptcha.textproducer.char.string">abcde2345678gfynmnpwx</prop>

	验证码长度
	<prop key="kaptcha.textproducer.char.length">4</prop>

	字体样式
	<prop key="kaptcha.textproducer.font.names">Arial, Courier</prop>

	字体大小
	<prop key="kaptcha.textproducer.font.size">40</prop>

	字体颜色，或者white,black,blue.
	<prop key="kaptcha.textproducer.font.color">black</prop>

    文字间隔
	<prop key="kaptcha.textproducer.char.space">2</prop>

	干扰实现类
    默认com.google.code.kaptcha.impl.DefaultNoise
    无干扰com.google.code.kaptcha.impl.NoNoise
	<prop key="kaptcha.noise.impl">com.google.code.kaptcha.impl.DefaultNoise</prop>

	干扰颜色，合法值： r,g,b 或者 white,black,blue.
	<prop key="kaptcha.noise.color">red</prop>

	图片样式，默认为水纹
    水纹com.google.code.kaptcha.impl.WaterRipple
	鱼眼com.google.code.kaptcha.impl.FishEyeGimpy
	阴影com.google.code.kaptcha.impl.ShadowGimpy
    <prop key="kaptcha.obscurificator.impl">com.google.code.kaptcha.impl.WaterRipple</prop>、

	背景实现类
    <prop key="kaptcha.background.impl">com.google.code.kaptcha.impl.DefaultBackground</prop>

	背景颜色渐变，开始颜色
	<prop key="kaptcha.background.clear.from">green</prop>

	背景颜色渐变，结束颜色
	<prop key="kaptcha.background.clear.to">white</prop>

	文字渲染器
	<prop key="kaptcha.word.impl">com.google.code.kaptcha.text.impl.DefaultWordRenderer</prop>

	session key
	<prop key="kaptcha.session.key">KAPTCHA_SESSION_KEY</prop>

	session date
	<prop key="kaptcha.session.date">KAPTCHA_SESSION_DATE</prop>

