---
layout: post
title:  "Java反射知识点"
subtitle:  "Java Reflect"
date:   2016-08-07 10:22:43 +0800
author: PhychoLee
categories: java
header-img: 
---

## Java反射知识点  ##

### Class类 ###

Java中的类都是java.lang.Class类的实例对象

**Class的三种表示方式**


{% highlight ruby %}

	//第一种方式,即每个类都有一个隐藏属性class
	Class c1 = Person.class;
	//第二种方式，通过Person类的实例对象获得
	Class c2 = p1.getClass();
	/*
	 *c1,c2为Person类的class type
	 *类也是对象，是Class的实例对象
	 */
	
	//第三种表达方式,通过全类名获取
	Class c3 = null;
	try{
		c3 = Class.forName("com.llf.reflect.Person");
	} catch(ClassNotFoundException e){
		e.printStackTrace();
	}

	//通过class type来创建Person类的实例对象
	try{
		Person p2 = (Person) c1.newInstance();
		p2.sayHi();
	} catch(InstantiationException e){
		e.printStackTrace();
	} catch(IllegalAccessException e){
		e.printStackTrace();
	}


	class Person(){
		public void sayHi(){
			System.out.println("Hi!");
		}
	}

{% endhighlight %}

---

### 动态加载类 ###

- 静态加载

	通常用的new创建对象就是静态加载类，在编译时就要加载所有在代码中所写到的类

- **动态加载**

	动态加载类即为上面的第三种表现方式,动态加载只在运行时加载，即在**编译时不判断当前代码中所用到的类是否存在**。

{% highlight ruby %}

	try{
		//在编译时不判断Person类是否真的存在
		Class c = Class.forName("com.llf.reflect.Person");
		Person p = (Person) c.newInstance();
		p.sayHi();
	} catch(Exception e){
		e.printStackTrace();
	}

{% endhighlight %}

`附加知识点`

{% highlight ruby %}

	public class Test{
		public static void main(String[] args){
			try{
					
				Class c = Class.forName(args[0]);
				Person p = (Person) c.newInstance();
				p.sayHi();
			} catch(Exception e){
				e.printStackTrace();
			}
		}
	}

	在命令行编译完Test类后，运行时可直接传入Person类,然后通过args[0]获取到类名
	>javac Test.java
	>java Test Person

{% endhighlight %}

---

### Method类 ###

- 通过class type获取类的**方法**信息

{% highlight ruby %}

	Class c = obj.getClass();
	//获取此类的所有public方法，包括继承父类的方法
	Method[] ms = c.getMethods();
	//获取所有该类自己声明的方法,不管访问权限
	Method[] dms =c.getDeclaredMethods();

	for(Method method:ms){
		//获取方法名
		method.getName();
		//获取返回类型的名称
		method.getReturnType().getName;
		//获取方法参数class type数组
		Class[] params = method.getParameterType();
	}

{% endhighlight %}

---

### Field类 ###

- 通过class type获取类的**变量**信息

{% highlight ruby %}

	Class c = obj.getClass();
	//获取此类的所有public变量，包括继承父类的变量
	Field[] fs = c.getFields();
	//获取所有该类自己声明的变量
	Field[] dfs =c.getDeclaredFields();

	for(Field field:dfs){
		//获取变量的类型的class type
		Class fieldType = field.getType();
		String typeName = fieldType.getName();
		//获取变量名
		String fieldName = field.getName();
	}

{% endhighlight %}

---

### Constructor类 ###

获取构造函数

{% highlight ruby %}

	Class c = obj.getClass();
	Constructor[] cs = c.getDeclaredConstructors();
	for(Constructor constructor:cs){
		//获取构造函数名
		constructor.getName();
		//获取参数的class type
		Class[] paramType = constructor.getParameter();
	}



{% endhighlight %}

### 反射调用方法 ###

用反射调用某个实例的方法

{% highlight ruby %}

	Person p = new Person;
	Class c = p.getClass();
	
	//获取方法
	Method m = c.getMethod("sayHi", String.class);
	//调用方法
	m.invoke(p, "meta");

	
	public class Person{
		public void sayHi(String name){
			System.out.println("Hi, I'm "+name);
		}
	}
	
{% endhighlight %}

---

### 泛型 ###

- 泛型只在编译时有效

	比如：List&lt;String&gt; list = new ArrayList&lt;String&gt;();

	一般认为在list中只能添加String类型的值，但绕过编译，用反射机制给list添加值，则可以添加Integer类型的值，但此时foreach就不能使用。