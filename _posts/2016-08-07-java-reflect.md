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

