---
layout: post
title:  "Android基础知识"
subtitle:  "Android"
date:   2016-08-12 11:53:51 +0800
author: PhychoLee
categories: android
header-img: 
---

# Android小知识点 #

---

- Android4.4以后，Google提高了MEDIA_MOUNTED的权限，导致无法发送广播，会报下面的错误

{% highlight ruby %}

	java.lang.SecurityException: Permission Denial: 
	not allowed to send broadcast android.intent.action.MEDIA_MOUNTED

	//解决办法为

	if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
		//在4.4版本中使用如下方法发送广播
        Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
		//file为要扫描的文件
        mediaScanIntent.setData(Uri.fromFile(file));            
		sendBroadcast(mediaScanIntent);
        System.out.println("sd扫描");
    } else {
    	//发送sd卡就绪意图
    	Intent intent = new Intent();
    	intent.setAction(Intent.ACTION_MEDIA_MOUNTED);
    	intent.setData(Uri.fromFile(Environment.getExternalStorageDirectory()));
    	sendBroadcast(intent);
	}

{% endhighlight %}

---

- 在项目的Activity中如果使用支持包android.support.v7.app.ActionBarActivity，则主题不能使用@android:style/下的Theme，否则会报错，只能用@style/AppTheme

---

- 转跳到安装界面,可使用以下代码

{% highlight ruby %}

	Intent intent = new Intent(Intent.ACTION_VIEW);
	intent.addCategory("android.intent.category.DEFAULT");
	intent.setDataAndType(Uri.fromFile(arg0.result), "application/vnd.android.package-archive");
	//startActivity(intent);
	//返回数据，用户选择取消安装后进入主界面
	startActivityForResult(intent, 0);

{% endhighlight %}

---

- 关于TitleBar

{% highlight ruby %}

	//在AndroidManifest.xml设置主题时，一般使用默认的@style/AppTheme。但是此主题会有标题栏，可打开style.xml文件，在AppTheme中添加以下代码

	< item name="@android:windowNoTitle">true</item >

{% endhighlight %}

---

- selector样式定义

自定义Button或TextView等部件的背景样式，可以在drawable下定义一个selector文件。
如：btn_ green_selector.xml

{% highlight ruby %}

	<?xml version="1.0" encoding="utf-8"?>
	<selector xmlns:android="http://schemas.android.com/apk/res/android" >
		<!-- pressed按下时的图片 -->
		<item android:drawable="@drawable/function_greenbutton_pressed" android:state_pressed="true"/>
		<!-- focused焦点图片 -->
		<item android:drawable="@drawable/function_greenbutton_pressed" android:state_focused="true"/>
		<!-- default默认图片 -->
		<item android:drawable="@drawable/function_greenbutton_normal"/>
	</selector>

{% endhighlight %}

	也可将上面的图片替换为自定义的shape文件。如：gradient_box.xml

{% highlight ruby %}

	<?xml version="1.0" encoding="utf-8"?>
	<shape xmlns:android="http://schemas.android.com/apk/res/android" 
		android:shape="rectangle">

		<!-- 圆角角度 -->
		<corners 
    		android:radius="5dp"
    		/>
		<!-- 渐变-->
		<gradient 
	        android:startColor="#0f0"
	        android:endColor="#00f"
	        android:centerColor="#fff"
	        /> 
		<!-- 纯色 -->
		<solid 
		    android:color="#5000"
		    />
		<!-- 边框 -->
		<stroke 
		    android:width="1dp"
		    android:color="#000"
		    android:dashWidth="5dp"
		    android:dashGap="3dp"
		    />
	</shape>

{% endhighlight %}

---

- 动态注册广播

{% highlight ruby %}

	//动态注册去电广播
	OutCallReceiver receiver = new OutCallReceiver();
	IntentFilter filter = new IntentFilter();
	filter.addAction(Intent.ACTION_NEW_OUTGOING_CALL);
	registerReceiver(receiver, filter);

	//解绑注册
	unregisterReceiver(receiver);

{% endhighlight %}

---

- 悬浮窗

**显示悬浮窗代码**

{% highlight ruby %}

	WindowManager mWM = (WindowManager) this.getSystemService(Context.WINDOW_SERVICE);

	WindowManager.LayoutParams params = new WindowManager.LayoutParams();
	params.height = WindowManager.LayoutParams.WRAP_CONTENT;
	params.width = WindowManager.LayoutParams.WRAP_CONTENT;
	params.flags = WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
			| WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
			| WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON;
	params.format = PixelFormat.TRANSLUCENT;
	params.type = WindowManager.LayoutParams.TYPE_TOAST;
	// 设置重心为左上角
	params.gravity = Gravity.LEFT + Gravity.TOP;
	params.setTitle("Toast");
	//添加要显示的view
	mWM.addView(view, params);

{% endhighlight %}

---

- 多击事件
	
**谷歌官方多击事件代码**

{% highlight ruby %}
	
	long[] mHits = new long[3];//表示3击事件
	public void onClick(View v){
		System.arraycopy(mHits, 1, mHits, 0, mHits.length - 1);
		mHits[mHits.length - 1] = SystemClock.uptimeMillis();//开机时间
		if(mHits[0] >= (SystemClock.uptimeMillis() - 500)){//500毫秒内完成3次点击
			//操作
		}
	}

{% endhighlight %}

---

- 初次使用AndroidStudio所遇问题

在app的build.gradle配置文件中，compileSdkVersion的sdk版本要和依赖包中的支持包版本一致

{% highlight ruby %}

	compileSdkVersion 23
	buildToolsVersion '23.0.3'
	
	compile 'com.android.support:appcompat-v7:23.3.0'

{% endhighlight %}

单元测试在src下新建`androidTest->java->com.xxx.xxx`,新建类继承`AndroidTestCase`.
		
{% highlight ruby %}

	//获取Context的方法
	private Context mContext;
	@Override
	protected void setUp() throws Exception {
    	mContext = getContext();
    	super.setUp();
	}
	
	//测试方法用testXxx()命名
	public void testAdd(){}

{% endhighlight %}

---

- 生成桌面快捷图标

{% highlight ruby %}

	//生成快捷图标
	Intent shortcutIntent = new Intent("com.android.launcher.action.INSTALL_SHORTCUT");
	//不重复生成快捷图标
	shortcutIntent.putExtra("duplicate", false);
	//名字
	shortcutIntent.putExtra(Intent.EXTRA_SHORTCUT_NAME,"手机卫士");
	//图标
	shortcutIntent.putExtra(Intent.EXTRA_SHORTCUT_ICON, BitmapFactory.decodeResource(getResources(), R.drawable.ic_launcher));
	//意图
	//注意: ComponentName的第二个参数必须加上点号(.)，否则快捷方式无法启动相应程序
	ComponentName comp = new ComponentName(this.getPackageName(), this.getPackageName() + "." +this.getLocalClassName());
	Intent intent = new Intent(Intent.ACTION_MAIN);
	intent.setComponent(comp);
	intent.addCategory(Intent.CATEGORY_LAUNCHER);
	shortcutIntent.putExtra(Intent.EXTRA_SHORTCUT_INTENT, intent);
	sendBroadcast(shortcutIntent);

{% endhighlight %}

**在`AndroidManifest.xml`加入权限**
		
{% highlight ruby %}

	<uses-permission android:name="com.android.launcher.permission.INSTALL_SHORTCUT" />
	<uses-permission android:name="com.android.launcher.permission.UNINSTALL_SHORTCUT" />

{% endhighlight %}

---

- 进程相关信息

{% highlight ruby %}

	ActivityManager activityManager = (ActivityManager) getSystemService(ACTIVITY_SERVICE);
    //得到应用进程
    List<ActivityManager.AppTask> appTasks = activityManager.getAppTasks();

    ActivityManager.MemoryInfo outInfo = new ActivityManager.MemoryInfo();
    activityManager.getMemoryInfo(outInfo);
    //剩余内存
    long availMem = outInfo.availMem;
    //总内存
    long totalMem = outInfo.totalMem;


{% endhighlight %}

---

- 通知改变数据，可用内容观察者
	
	- 首先在改变事件的代码处通知改变（如添加、删除操作）

{% highlight ruby %}

	context.getContentResolver().notifyChange(uri, observer);

{% endhighlight %}


	- 其次在需要改变数据的地方注册内容观察者


{% highlight ruby %}

	context.getContentResolver().registerContentResolver(uri, notyfyForDenscendents, new ContentObserver(){
		public void ContentObserver(Handler handler){
			super(handler);
		}
		public void onChange(boolean selfChange){
			//改变数据操作
		}
		
	});
	
{% endhighlight %}