---
layout: post
title:  "SpringBoot使用Hibernate Validator校验参数"
subtitle:  "Hibernate Validator"
date:   2018-07-12 18:14:00 +0800
author: PhychoLee
categories: [spring]
header-img:
---

# Hibernate Validator

后端开发中，常常需要对入参进行非空、非法格式校验，以确保数据的安全性和准确性。一般会在Controller层进行校验，此类代码臃肿且规律，在参数多的情况下简直是灾难，严重影响代码的整洁度。如下代码所示：

	@PostMapping("")
    public JsonData save(Activity activity){
        if (StringUtils.isEmpty(activity.getName())){
            return JsonData.fail("活动名称不能为空");
        }
        if (StringUtils.isEmpty(activity.getType())){
            return JsonData.fail("活动类型不能为空");
        }
        if (activity.getStartTime() == null){
            return JsonData.fail("开始时间不能为空");
        }
        if (activity.getEndTime() == null){
            return JsonData.fail("结束时间不能为空");
        }

        activityService.save(activity);

        return JsonData.success(activity);
    }

Hibernate Validator提供了使用注解来校验参数，可以优雅的解决这个问题。SpringBoot已加入Hibernate Validator依赖，不需要单独添加。下面从不同入参形式来看Hibernate Validator如何校验参数。

## 校验实体类型参数

参数比较多时，一般会使用dto、vo、po来封装参数，在实体类中课加入以下注解，其他注解请自行查阅相关文档。

	private Integer id;

    @NotBlank(message = "活动名称不能为空")
    private String name;

    @NotBlank(message = "活动类型不能为空")
    private String type;

    @NotNull(message = "开始时间不能为空")
    private Date startTime;

    @NotNull(message = "结束时间不能为空")
    private Date endTime;

    private String description;

在controller方法中使用@Validated注解实体类，同时引入参数BindingResult，BindingResult就是校验结果，然后将结果遍历返回即可。

	@PostMapping("")
    public JsonData save(@RequestBody @Validated Activity activity, BindingResult result){
        if (result.hasErrors()) {
            StringBuilder errorMsg = new StringBuilder();
            for (ObjectError error : result.getAllErrors()) {
                errorMsg.append(error.getDefaultMessage()).append(",");
            }
			errorMsg.delete(errorMsg.length() - 1, errorMsg.length());
            return JsonData.fail(errorMsg.toString());
        }
        
        activityService.save(activity);

        return JsonData.success(activity);
    }


如果想只校验一个不通过就快速返回，可以加入以下配置。

	@Bean
    public Validator validator(){
        ValidatorFactory validatorFactory = Validation.byProvider( HibernateValidator.class )
                .configure()
                .addProperty( "hibernate.validator.fail_fast", "true" )
                .buildValidatorFactory();
        return validatorFactory.getValidator();
    }

虽然比手动校验优雅很多了，但还是有一段重复代码，需要手动返回校验错误的信息。这并不是我想要的，我希望能够完全没有重复代码，还一个干净清爽的controller。

查询资料和博客，发现都没有具体的实现方式，只能自己硬着头皮打断点查看源码。最后在RequestResponseBodyMethodProcessor.resolveArgument()中找到的关键点，此方法会校验被@Validated注解的对象，关键在于红框的内容，isBindExceptionRequired方法会判断controller方法有无引入BindingResult，没有则抛出MethodArgumentNotValidException。

![](/assets/posts_img/springboot_validator/resolveargument.png)

![](/assets/posts_img/springboot_validator/isbindexceptionrequired.png)

有了这个异常抛出，接下来就好办了。首先controller方法去掉BindingResult。

	@PostMapping("")
    public JsonData save(@RequestBody @Validated Activity activity){
        activityService.save(activity);

        return JsonData.success(activity);
    }

然后在全局异常处理中针对MethodArgumentNotValidException做特殊处理。由于在MethodArgumentNotValidException已聚合的BindingResult，所以捕获到异常即可写出校错误信息。

	@ControllerAdvice
	public class GlobalExceptionHandler {

	    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
	
	    @ExceptionHandler(Exception.class)
	    @ResponseBody
	    public JsonData handleException(Exception e){
	        logger.error(e.getMessage(), e);
	
	        //Hibernate Validator验证消息返回
	        if (e instanceof MethodArgumentNotValidException){
	            BindingResult result = ((MethodArgumentNotValidException) e).getBindingResult();
	            StringBuilder errorMsg = new StringBuilder();
	            for (ObjectError error : result.getAllErrors()) {
	                errorMsg.append(error.getDefaultMessage()).append(",");
	            }
				errorMsg.delete(errorMsg.length() - 1, errorMsg.length());
	            return JsonData.fail(errorMsg.toString());
	        }
	
	        return JsonData.error(e.getMessage(), null);
	    }
	}

## 其他参数形式

上面只是针对有@RequestBody的json入参，对于普通的表单形式就无效了。原因是两种入参形式解析的Processor是不同的。表单入参的参数校验在ModelAttributeMethodProcessor.resolveArgument()中，可发现抛出的异常是BindException。所以只需要在全局异常处理对BindException也进行处理。

![](/assets/posts_img/springboot_validator/resolveargument2.png)

	@ExceptionHandler(Exception.class)
    @ResponseBody
    public JsonData handleException(Exception e){
        logger.error(e.getMessage(), e);

        //Hibernate Validator验证消息返回
        BindingResult result = null;
        if (e instanceof MethodArgumentNotValidException){
            result = ((MethodArgumentNotValidException) e).getBindingResult();
        } else if (e instanceof BindException){
            result = ((BindException) e).getBindingResult();
        }
        if (result != null) {
            StringBuilder errorMsg = new StringBuilder();
            for (ObjectError error : result.getAllErrors()) {
                errorMsg.append(error.getDefaultMessage()).append(",");
            }
			errorMsg.delete(errorMsg.length() - 1, errorMsg.length());
            return JsonData.fail(errorMsg.toString());
        }

        return JsonData.error(e.getMessage(), null);
    }

很多时候，我们需要下面这种参数的校验，虽然此类参数可以通过@RequestParam来校验，但我们希望能够自定义错误返回信息。

	@PostMapping("")
    public JsonData save(@NotBlank(message = "名称不能为空") String name){
        return JsonData.success();
    }

具体的操作是像上面代码加入注解校验，然后在Controller方法上加入@Validated注解。此时，如果校验不通过就会在MethodValidationInterceptor.invoke()中抛出ConstraintViolationException。

![](/assets/posts_img/springboot_validator/methodvalidationinterceptor.png)

从上图中看到ConstraintViolationException并不包含BindingResult，而是Set<ConstraintViolation<Object>>。对ConstraintViolationException的处理和上面两种异常不太一样。

	@ExceptionHandler(Exception.class)
    @ResponseBody
    public JsonData handleException(Exception e){
        logger.error(e.getMessage(), e);

        //Hibernate Validator验证消息返回
        BindingResult result = null;
        if (e instanceof MethodArgumentNotValidException){
            result = ((MethodArgumentNotValidException) e).getBindingResult();
        } else if (e instanceof BindException){
            result = ((BindException) e).getBindingResult();
        } else if (e instanceof ConstraintViolationException){
            Set<ConstraintViolation<?>> constraintViolations = ((ConstraintViolationException) e).getConstraintViolations();
            StringBuilder errorMsg = new StringBuilder();
            for (ConstraintViolation<?> violation : constraintViolations) {
                errorMsg.append(violation.getMessage()).append(",");
            }
			errorMsg.delete(errorMsg.length() - 1, errorMsg.length());
            return JsonData.fail(errorMsg.toString());
        }
        if (result != null) {
            StringBuilder errorMsg = new StringBuilder();
            for (ObjectError error : result.getAllErrors()) {
                errorMsg.append(error.getDefaultMessage()).append(",");
            }
			errorMsg.delete(errorMsg.length() - 1, errorMsg.length());
            return JsonData.fail(errorMsg.toString());
        }

        return JsonData.error(e.getMessage(), null);
    }

到此，就可以只加注解就对各种入参进行校验，不再需要copy重复的代码。

## 项目源代码

[https://github.com/phycholee/util_demo](https://github.com/phycholee/util_demo)