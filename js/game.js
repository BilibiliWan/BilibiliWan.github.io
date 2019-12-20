var config = {
	width: 320,
	height: 505,
	type: Phaser.AUTO,
	title: game
}

var game = new Phaser.Game(config); //实例化game

game.States = {}; //存放state对象-boot-preload-menu-play

game.States.boot = function(){
	this.preload = function(){
		//移动设备适应
		if(!game.device.desktop){
			this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
			this.scale.forcePortrait = true;
			this.scale.refresh();
		}
		//加载动画
		game.load.image('loading', 'assets/preloader.gif');
	};

	this.create = function(){
		
	};

	this.update = function(){
		//跳转到资源加载页面
		game.state.start('preload');
	};
}

game.States.preload = function(){
	this.preload = function(){
		//以下为要加载的资源
		game.load.image('background', 'assets/background.png'); //背景
		game.load.image('ground', 'assets/ground.png'); //地面
		game.load.image('floor', 'assets/floor.png'); //天花板
    	game.load.image('title', 'assets/title.png'); //游戏标题
    	game.load.spritesheet('bird','assets/bird.png',34,24,3); //鸟-34px*24px*3
    	game.load.image('button', 'assets/start-button.png'); //按钮
		game.load.spritesheet('pipe', 'assets/pipes.png',54,320,2); //管道
		game.load.image('goldMedal', 'assets/goldMedal.png'); //金牌
		game.load.image('silverMedal', 'assets/silverMedal.png'); //银牌
		game.load.image('noMedal', 'assets/noMedal.png') //无奖牌

		// 字体
    	game.load.bitmapFont('flappy_font', 'assets/fonts/flappyfont/flappyfont.png', 'assets/fonts/flappyfont/flappyfont.fnt');
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
		//背景图
		game.add.tileSprite(0, 0, game.width, game.height, 'background').autoScroll(-10,0);
		//地板
		game.add.tileSprite(0, game.height-112, game.width, 112, 'ground').autoScroll(-100,0);

		var titleGroup = game.add.group(); //创建存放标题的组
		titleGroup.create(0, 0, 'title'); //标题

		var bird = titleGroup.create(190, 10, 'bird'); //添加bird到组里
		//鸟的翅膀拍打
		bird.animations.add('fly'); //添加动画
		// name/frames-per-second/loop
		bird.animations.play('fly', 12, true); //播放动画
		
		titleGroup.x = 35;
		titleGroup.y = 100;
		
		//from-to: property/duration/ease/autoStart/delay/repeat/yoyo
		game.add.tween(titleGroup).to({ y:120 }, 1000, null, true, 0, Number.MAX_VALUE, true); //标题的缓动动画
		
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

	this.create = function(){
		//背景
		this.bg = game.add.tileSprite(0, 0, game.width, game.height,'background');
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
		this.ground.body.immovable = true; //固定不动
		//天花板
		game.physics.enable(this.floor, Phaser.Physics.ARCADE);
		this.floor.body.immovable = true; //固定不动

		//声音
		this.soundFly = game.add.sound('fly_sound');
		this.soundScore = game.add.sound('score_sound');
		this.soundHitPipe = game.add.sound('hit_pipe_sound');
		this.soundHitGround = game.add.sound('hit_ground_sound');

		//提示信息
		this.scoreText = game.add.bitmapText(game.world.centerX-20, 30, 'flappy_font', '0', 36);
		this.readyText = game.add.image(game.width/2, 40, 'ready_text'); //get ready 文字
		this.playTip = game.add.image(game.width/2,300,'play_tip'); //提示点击
		this.readyText.anchor.setTo(0.5, 0);
		this.playTip.anchor.setTo(0.5, 0);

		this.hasStarted = false; //游戏是否已开始
		//12.20 17：04
		game.time.events.loop(900, this.generatePipes, this);
		game.time.events.stop(false);
		game.input.onDown.addOnce(this.statrGame, this);

	};
	
	this.update = function(){
		if(!this.hasStarted)
			return; //游戏未开始
		
		game.physics.arcade.collide(this.bird, this.ground, this.hitGround, null, this); //与地面碰撞
		game.physics.arcade.collide(this.bird, this.floor, this.hitFloor, null, this); //与天花板碰撞
		game.physics.arcade.overlap(this.bird, this.pipeGroup, this.hitPipe, null, this); //与管道碰撞
		
		if(this.bird.angle < 90)
			this.bird.angle += 2.5; //下降时头朝下
		
		this.pipeGroup.forEachExists(this.checkScore,this); //分数检测和更新
	}

	// 以下是各类函数
	// 游戏开始
	this.statrGame = function(){
		this.gameSpeed = 200; //游戏速度
		this.gameIsOver = false; //游戏未结束
		this.hasHitGround = false; //鸟未撞地
		this.hasHitFloor = false; //鸟未撞天花板
		this.hasStarted = true; //游戏已开始
		
		this.score = 0;
		this.bg.autoScroll(-(this.gameSpeed/10), 0); //背景移动
		this.ground.autoScroll(-this.gameSpeed, 0); //地面移动
		this.bird.body.gravity.y = 1150; //鸟的重力
		
		this.readyText.destroy();
		this.playTip.destroy(); //删除提示
		
		game.input.onDown.add(this.fly, this);
		game.time.events.start();
	}

	// 游戏结束
	this.stopGame = function(){
		this.bg.stopScroll();
		this.ground.stopScroll();
		this.pipeGroup.forEachExists(function(pipe){
			pipe.body.velocity.x = 0;
		}, this);
		this.bird.animations.stop('fly', 0);
		game.input.onDown.remove(this.fly,this);
		game.time.events.stop(true);
	}

	// 飞行动作
	this.fly = function(){
		this.bird.body.velocity.y = -350;
		game.add.tween(this.bird).to({angle:-30}, 100, null, true, 0, 0, false); //上升时头朝上
		this.soundFly.play();
	}


	// 撞击
	// 撞击柱子
	this.hitPipe = function(){
		if(this.gameIsOver) return;
		this.soundHitPipe.play();
		this.gameOver();
	}
	// 撞击地面
	this.hitGround = function(){
		if(this.hasHitGround) return; //已经撞击过地面
		this.hasHitGround = true;
		this.soundHitGround.play();
		this.gameOver(true);
	}
	// 撞击天花板
	this.hitFloor = function(){
		if(this.hasHitFloor) return; //已经撞击过天花板
		this.hasHitFloor = true;
		this.gameOver(true);
	}


	// 游戏结束
	this.gameOver = function(show_text){
		this.gameIsOver = true;
		this.stopGame();
		if(show_text) this.showGameOverText();
	};
	// 游戏结束信息
	this.showGameOverText = function(){
		this.scoreText.destroy();
		game.bestScore = game.bestScore || 0;
		
		if(this.score > game.bestScore)
			game.bestScore = this.score; //最好分数
		
		this.gameOverGroup = game.add.group(); //添加一个组-分数版+gameover文字图片

		var gameOverText = this.gameOverGroup.create(game.width/2, 0, 'game_over'); //game over 文字图片
		var scoreboard = this.gameOverGroup.create(game.width/2, 70, 'score_board'); //分数板
		
		var currentScoreText = game.add.bitmapText(game.width/2 + 60, 105, 'flappy_font', this.score+'', 20, this.gameOverGroup); //当前分数
		var bestScoreText = game.add.bitmapText(game.width/2 + 60, 153, 'flappy_font', game.bestScore+'', 20, this.gameOverGroup); //最好分数

		if(this.score >= 20){
			var medals = this.gameOverGroup.create(game.width/2 - 65, 110, 'goldMedal'); //金牌
		}else if(this.score >= 10){
			var medals = this.gameOverGroup.create(game.width/2 - 65, 110, 'silverMedal'); //银牌
		}else{
			var medals = this.gameOverGroup.create(game.width/2 - 65, 110, 'noMedal'); //无奖牌
		}
		
		var replayBtn = game.add.button(game.width/2, 210, 'button', function(){//重玩按钮
			game.state.start('play');
		}, this, null, null, null, null, this.gameOverGroup);

		gameOverText.anchor.setTo(0.5, 0);
		scoreboard.anchor.setTo(0.5, 0);
		replayBtn.anchor.setTo(0.5, 0);
		medals.anchor.setTo(0.5, 0);
		
		this.gameOverGroup.y = 30;
	}


	//管道
	//制造管道
	this.generatePipes = function(gap){
		gap = gap || 100; //上下管道之间的间隙宽度
		var position = (505 - 320 - gap) + Math.floor((505 - 112 - 30 - gap - 505 + 320 + gap) * Math.random());
		var topPipeY = position-360;
		var bottomPipeY = position+gap;

		if(this.resetPipe(topPipeY,bottomPipeY)) return;

		var topPipe = game.add.sprite(game.width, topPipeY, 'pipe', 0, this.pipeGroup);
		var bottomPipe = game.add.sprite(game.width, bottomPipeY, 'pipe', 1, this.pipeGroup);
		this.pipeGroup.setAll('checkWorldBounds',true);
		this.pipeGroup.setAll('outOfBoundsKill',true);
		this.pipeGroup.setAll('body.velocity.x', -this.gameSpeed);
	}
	//重置出了边界的管道，做到回收利用
	this.resetPipe = function(topPipeY,bottomPipeY){
		var i = 0;
		this.pipeGroup.forEachDead(function(pipe){
			if(pipe.y<=0){ //topPipe
				pipe.reset(game.width, topPipeY);
				pipe.hasScored = false; //重置为未得分
			}else{
				pipe.reset(game.width, bottomPipeY);
			}
			pipe.body.velocity.x = -this.gameSpeed;
			i++;
		}, this);
		return i == 2; //如果 i==2 代表有一组管道已经出了边界，可以回收这组管道了
	}

	//负责分数的检测和更新
	this.checkScore = function(pipe){
		if(!pipe.hasScored && pipe.y<=0 && pipe.x<=this.bird.x-17-54){
			pipe.hasScored = true;
			this.scoreText.text = ++this.score;
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

