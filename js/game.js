var config = {
	width: 320,
	height: 505,
	type: Phaser.AUTO,
	title: game
}

//实例化game
var game = new Phaser.Game(config);

//存放state对象
game.States = {}; //四个States-boot-preload-menu-play

game.States.boot = function(){

	this.preload = function(){
		//移动设备适应
		if(!game.device.desktop){
			this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; //显示所有游戏区域并保持高宽比
			this.scale.forcePortrait = true; //竖屏
			this.scale.refresh();
		}
		
		//加载动画
		game.load.image('loading', 'assets/preloader.gif');
	};

	this.create = function(){
		//跳转到资源加载页面
		game.state.start('preload');
	};

	this.update = function(){
		
	};
}

game.States.preload = function(){

	this.preload = function(){
		
		//以下为要加载的资源
		
		game.load.image('background', 'assets/background.png'); //背景
		game.load.image('ground', 'assets/ground.png'); //地面
		game.load.image('floor', 'assets/floor.png'); //天花板
    	game.load.image('title', 'assets/title.png'); //游戏标题
		game.load.image('button', 'assets/start-button.png'); //按钮

		// 鸟和管道
		game.load.spritesheet('bird','assets/bird.png',34, 24, 3); //鸟-34px*24px*3
		game.load.spritesheet('pipe', 'assets/pipes.png', 54, 320, 2); //管道-52px*320px*2
		
		// 奖牌
		game.load.image('goldMedal', 'assets/goldMedal.png'); //金牌
		game.load.image('silverMedal', 'assets/silverMedal.png'); //银牌
		game.load.image('noMedal', 'assets/noMedal.png') //无奖牌

		// 字体
    	game.load.bitmapFont('flappy_font', 'assets/fonts/flappyfont/flappyfont.png', 'assets/fonts/flappyfont/flappyfont.fnt');
		
		// 音效
		game.load.audio('fly_sound', 'assets/flap.wav'); //飞翔的音效
    	game.load.audio('score_sound', 'assets/score.wav'); //得分的音效
    	game.load.audio('hit_pipe_sound', 'assets/pipe-hit.wav'); //撞击管道的音效
    	game.load.audio('hit_ground_sound', 'assets/ouch.wav'); //撞击地面的音效

		// 提示信息
    	game.load.image('ready_text', 'assets/getready.png');
    	game.load.image('play_tip', 'assets/playtip.png'); 
    	game.load.image('game_over', 'assets/gameover.png');
    	game.load.image('score_board', 'assets/scoreboard.png');
	};

	this.create = function(){

		//创建显示loading进度的sprite
		var preloadSprite = game.add.sprite(35, game.height/2, 'loading');
		game.load.setPreloadSprite(preloadSprite);
	};

	this.update = function(){
		
		game.state.start('menu');
	};
}

game.States.menu = function(){
	this.preload = function(){

	};

	this.create = function(){
		
		//TileSprite - 具有重复纹理的游戏对象，可以滚动和缩放
		//背景图
		game.add.tileSprite(0, 0, game.width, game.height, 'background').autoScroll(-10, 0);
		//地板
		game.add.tileSprite(0, game.height-112, game.width, 112, 'ground').autoScroll(-100, 0);
		
		//创建一个组
		var titleGroup = game.add.group(); 
		titleGroup.create(0, 0, 'title'); //添加标题到组里
		var bird = titleGroup.create(190, 10, 'bird'); //添加鸟到组里

		//鸟的翅膀拍打
		bird.animations.add('fly'); //添加动画
		//<tips> - 名字/每秒帧数/是否循环
		bird.animations.play('fly', 12, true); //播放动画
		
		//设置标题组的位置
		titleGroup.x = 35;
		titleGroup.y = 100;
		
		//标题的缓动动画
		//补间动画Tween - from-to: 属性/持续时间/缓动功能/自动播放/开始延迟/自动重复时间/播放完自动倒放
		game.add.tween(titleGroup).to({ y:120 }, 1000, null, true, 0, Number.MAX_VALUE, true);
		
	};

	this.update = function(){

		//开始按钮
		var button = game.add.button(game.width/2, game.height/2, 'button', function(){
			game.state.start('play');
		});
		button.anchor.setTo(0.5,0.5);
	};
}

game.States.play = function(){

	this.preload = function(){

	};

	this.create = function(){
		
		//背景
		this.bg = game.add.tileSprite(0, 0, game.width, game.height, 'background');
		//地板
		this.ground = game.add.tileSprite(0, game.height-112, game.width, 112, 'ground');
		//天花板
		this.floor = game.add.tileSprite(0, game.height-505-125, game.width, 112, 'floor');
		//管道
		this.pipeGroup = game.add.group();
		this.pipeGroup.enableBody = true; //赋予组内创建的精灵元素物理实体
		//鸟
		this.bird = game.add.sprite(50, 150, 'bird');
		this.bird.animations.add('fly');
		this.bird.animations.play('fly', 12, true);
		this.bird.anchor.setTo(0.5, 0.5);

		//物理系统
		//鸟
		game.physics.enable(this.bird, Phaser.Physics.ARCADE);
		this.bird.body.gravity.y = 0; //鸟的重力，未开始游戏，先不动
		//地面
		game.physics.enable(this.ground, Phaser.Physics.ARCADE);
		this.ground.body.immovable = true; //固定不动，否则一撞击就掉落
		//天花板
		game.physics.enable(this.floor, Phaser.Physics.ARCADE);
		this.floor.body.immovable = true; //固定不动

		//声音
		this.soundFly = game.add.sound('fly_sound');
		this.soundScore = game.add.sound('score_sound');
		this.soundHitPipe = game.add.sound('hit_pipe_sound');
		this.soundHitGround = game.add.sound('hit_ground_sound');

		//提示信息
		this.scoreText = game.add.bitmapText(game.world.centerX-20, 30, 'flappy_font', '0', 36); //游戏时的分数
		this.readyText = game.add.image(game.width/2, 40, 'ready_text'); //get ready 文字
		this.playTip = game.add.image(game.width/2, 300, 'play_tip'); //提示点击

		this.readyText.anchor.setTo(0.5, 0);
		this.playTip.anchor.setTo(0.5, 0);

		this.hasStarted = false; //游戏是否已开始

		//<Tips> - loop(delay, callback, callbackContext, arguments); 
		//以指定的时间间隔无限重复执行某一个函数，直到调用了stop()方法才停止
		//循环生成柱子
		game.time.events.loop(900, this.generatePipes, this);
		game.time.events.stop(false);

		//鼠标点击则开始游戏
		game.input.onDown.addOnce(this.startGame, this);

	};
	
	this.update = function(){

		if(!this.hasStarted)
			return; //游戏未开始

		game.physics.arcade.collide(this.bird, this.ground, this.hitGround, null, this); //与地面碰撞
		game.physics.arcade.collide(this.bird, this.floor, this.hitFloor, null, this); //与天花板碰撞
		game.physics.arcade.overlap(this.bird, this.pipeGroup, this.hitPipe, null, this); //与管道碰撞
		
		if(this.bird.angle < 90)
			this.bird.angle += 2.5; //下降时头朝下
		
		//分数检测和更新
		this.pipeGroup.forEachExists(this.checkScore, this); //对于组中每一根柱子进行分数检测
		
		//鼠标点击
		game.input.onDown.add(this.fly, this);
		
	}

	// 以下是各类函数

	// 飞行动作
	this.fly = function(){

		this.bird.body.velocity.y = -350; //上升时有一个向上的速度
		game.add.tween(this.bird).to({angle:-30}, 100, null, true, 0, 0, false); //上升时抬头的动画
		this.soundFly.play(); //飞翔的音效
	}

	// 游戏开始
	this.startGame = function(){
		
		this.gameSpeed = 200; //游戏速度

		this.gameIsOver = false; //游戏没有结束
		this.hasHitGround = false; //鸟没有撞地
		this.hasHitFloor = false; //鸟没有撞天花板
		this.hasStarted = true; //游戏已开始
		
		this.score = 0; //分数初始为0
		this.bg.autoScroll(-(this.gameSpeed/10), 0); //背景移动
		this.ground.autoScroll(-this.gameSpeed, 0); //地面移动
		this.bird.body.gravity.y = 1150; //鸟的重力
		
		//删除提示信息
		this.readyText.destroy();
		this.playTip.destroy();
		
		game.time.events.start(); //开始生成柱子
	}


	// 撞击类
	
	// 撞击柱子
	this.hitPipe = function(){

		if(this.gameIsOver)
			return;
		
		this.soundHitPipe.play();
		this.gameOver();
	}

	// 撞击地面
	this.hitGround = function(){
		
		//已经撞击过地面
		if(this.hasHitGround)
			return;

		this.hasHitGround = true;
		this.soundHitGround.play();
		this.gameOver(true);
	}

	// 撞击天花板
	this.hitFloor = function(){
		
		//已经撞击过天花板
		if(this.hasHitFloor)
			return;
		
		this.hasHitFloor = true;
		this.gameOver(true);
	}


	// 游戏终止类

	// 游戏停止
	this.stopGame = function(){

		this.bg.stopScroll(); //背景停止移动
		this.ground.stopScroll(); //地面停止移动

		// 柱子停止
		this.pipeGroup.forEachExists(function(pipe){
			pipe.body.velocity.x = 0;
		}, this);

		this.bird.animations.stop('fly', 0); //鸟飞行动画停止播放

		game.time.events.stop(true); //停止生成柱子
	}

	// 游戏结束
	this.gameOver = function(isOver){

		this.gameIsOver = true;
		this.stopGame();
		
		if(isOver)
			this.showGameOverText();
	};

	// 游戏结束信息
	this.showGameOverText = function(){

		this.scoreText.destroy(); //去掉游戏时的分数提示
		game.bestScore = game.bestScore || 0; //默认分数是0
		
		//最好分数
		if(this.score > game.bestScore)
			game.bestScore = this.score;
		
		//添加一个组
		//分数版 + gameover文字图片
		this.gameOverGroup = game.add.group();
		var gameOverText = this.gameOverGroup.create(game.width/2, 0, 'game_over'); //game over 文字图片
		var scoreboard = this.gameOverGroup.create(game.width/2, 70, 'score_board'); //分数板
		
		var currentScoreText = game.add.bitmapText(game.width/2 + 60, 105, 'flappy_font', this.score+'', 20, this.gameOverGroup); //当前分数
		var bestScoreText = game.add.bitmapText(game.width/2 + 60, 153, 'flappy_font', game.bestScore+'', 20, this.gameOverGroup); //最好分数

		if(this.score >= 20) {
			var medals = this.gameOverGroup.create(game.width/2 - 65, 110, 'goldMedal'); //金牌
		}
		else if(this.score >= 10) {
			var medals = this.gameOverGroup.create(game.width/2 - 65, 110, 'silverMedal'); //银牌
		}
		else {
			var medals = this.gameOverGroup.create(game.width/2 - 65, 110, 'noMedal'); //无奖牌
		}
		
		//重新开始按钮
		//添加该按钮进游戏结束组中
		var replayBtn = game.add.button(game.width/2, 210, 'button', function(){
			game.state.start('play');
		}, this, null, null, null, null, this.gameOverGroup);

		//设置锚点
		gameOverText.anchor.setTo(0.5, 0);
		scoreboard.anchor.setTo(0.5, 0);
		replayBtn.anchor.setTo(0.5, 0);
		medals.anchor.setTo(0.5, 0);
		
		this.gameOverGroup.y = 30;
	}


	//管道
	//制造管道
	this.generatePipes = function(gap){

		gap = 100; //上下管道之间的间隙宽度
		var position = (505 - 320 - gap) + 
			Math.floor((505 - 112 - 30 - gap - 505 + 320 + gap) * Math.random()); //计算出一个上下管道之间的间隙的随机位置
		var topPipeY = position-360; //上方管道的位置
		var bottomPipeY = position+gap; //下方管道的位置

		//添加sprite类型的管道进pipeGroup
		var topPipe = game.add.sprite(game.width, topPipeY, 'pipe', 0, this.pipeGroup);
		var bottomPipe = game.add.sprite(game.width, bottomPipeY, 'pipe', 1, this.pipeGroup);
		
		this.pipeGroup.setAll('checkWorldBounds',true); //检查边界
		this.pipeGroup.setAll('outOfBoundsKill',true); //出界的柱子kill
		this.pipeGroup.setAll('body.velocity.x', -this.gameSpeed); //设置管道运动速度
	}


	//负责分数的检测和更新
	this.checkScore = function(pipe){

		//pipe.hasScored - 标识该管道是否已经得过分
		//pipe.y < 0 - 一组管道中的上管道
		//pipe.x<=this.bird.x-17-54 - 管道x坐标+管道宽度<鸟x坐标时即得分
		if(!pipe.hasScored && pipe.y<=0 && pipe.x<=this.bird.x-17-54){
			pipe.hasScored = true;
			this.score++;
			this.scoreText.text = this.score;
			this.soundScore.play();
			return true;
		}
		return false;
	}
}

//添加state到游戏
game.state.add('boot',game.States.boot);
game.state.add('preload',game.States.preload);
game.state.add('menu',game.States.menu);
game.state.add('play',game.States.play);

//启动游戏
game.state.start('boot');

