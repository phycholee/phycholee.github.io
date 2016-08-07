---
layout: post
title:  "Java线程知识点"
subtitle:  "Java Thread"
date:   2016-08-06 21:03:11 +0800
author: PhychoLee
categories: java
header-img: 
---

> Java线程学习笔记


我对Java线程的运用比少，在JavaEE对框架进行开发很少用到多线程，在Android开发中稍微运用多一些，但只是最简单的创建线程，调用run方法。
这几天在慕课网观看视频*[细说多线程之Thread VS Runnable](http://www.imooc.com/view/312)*重新系统学习Java线程知识，对其进行归纳总结，以下是知识笔记：

### 线程创建的两种方式 ###


1. 继承Thread类
{% highlight ruby %}
	class MyThread extends Thread{
		@Override
		public void run(){

		}
	}
	MyThread t = new MyThread();//创建线程
	t.start();//启动线程
{% endhighlight %}

2. 实现Runnable接口
{% highlight ruby %}
	class MyThread implements Runnable{
		@Override
		public void run(){
	
		}
	}
	MyThread mt = new MyThread();
	Thread t = new Thread(mt);//创建线程
	t.start();//启动线程
{% endhighlight %}

实现Runnable接口方式可以避免Thread方式是单继承特性带来的缺陷。同时Runnable方法的代码可以被多个线程**共享**，适用于多个线程共享同一资源的情况。

### 线程生命周期 ###

一张图解释
![img](/assets/posts_img/20160806/thread_lifecircle.png)

### 守护线程 ###

