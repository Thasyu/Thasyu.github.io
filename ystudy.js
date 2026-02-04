
var config = {
	mogi: 50
};

var current = {
	target: null,
	count: 0,
	qroot: null,
	qs: null, // questions
	closed: null,
	currentIndex: 0, // 現在の問題番号
	score: 0, // 正解数
	answered: false // 解答済みフラグ
};



function shuffleArray(a)
{
	var n = a.length;
	var t;

	while (n > 1) {
		var r = Math.floor(Math.random() * n);

		--n;
		t = a[n];
		a[n] = a[r];
		a[r] = t;
	}

	return a;
}



function eventSelectRandom50(e)
{
	e.preventDefault();

	var all = shuffleArray($('body > ol > li > div > ol > li')); // question node

	var li = $('<li/>');
	var h2 = $('<h2/>').text('模擬試験');
	var div = $('<div/>');
	var ol = $('<ol/>')

	li.append(h2);
	li.append(div);
	div.append(ol);

	current.count = all.length < config.mogi ? all.length : config.mogi;
	var random50 = [];
	for (var i = 0; i < current.count; i++) {
		ol.append( all.eq(i) );
	}

	$('body > ol:first').append(li);
	current.target = li;

	startSection();
}


function eventSelectMenu(e)
{
	e.preventDefault();

	current.target = e.data;
	current.count = current.target.find('.sa, .ma').length;


	startSection();
}

function eventSelectOption(e)
{
	e.preventDefault();

	if (current.closed || current.answered) {
		return;
	}

	var tgt = e.data;

	if (tgt.parent().hasClass('sa')) {
		// 他の選択肢の選択を取り消す
		if (tgt.hasClass('selected')) {
			tgt.toggleClass('selected');
		} else {
			tgt.parent().find('li').removeClass('selected');
			tgt.addClass('selected');
		}
	} else {
		// 選択/未選択をスイッチ
		tgt.toggleClass('selected');
	}
}

function eventClickAnswer(e)
{
	e.preventDefault();
	
	if (current.answered) {
		return;
	}

	// 現在の問題
	var currentQ = $(current.qs[current.currentIndex]);
	var ol = currentQ.find('> ol');

	current.answered = true;

	// クリックイベントを削除
	ol.find('li').off('click');
	ol.find('li').css('cursor', 'default');

	// 正誤判定
	var correct = true;
	ol.find('li').each(function() {
		var o = $(this);
		if (o.hasClass('c') && !o.hasClass('selected') ||
			!o.hasClass('c') && o.hasClass('selected')) {
			correct = false;
		}
	});

	// 正解の選択肢を表示
	if (correct) {
		ol.find('li.c').addClass('correct');
		current.score++;
		$('#result').html('<div class="result-icon" style="color: #4CAF50;">◯</div>');
	} else {
		// 選択した選択肢をグレーで目立たなくする
		ol.find('li.selected').addClass('wrong-answer');
		// 正解の選択肢を赤い背景と赤文字で表示
		ol.find('li.c').addClass('show-answer');
		$('#result').html('<div class="result-icon" style="color: #f44336;">✕</div>');
	}
	
	// フェードイン・フェードアウト表示
	$('#result').addClass('show');
	setTimeout(function() {
		$('#result').removeClass('show');
	}, 2000);

	// ボタンを更新
	updateNavigator();
}

function eventClickNext(e)
{
	e.preventDefault();
	
	if (current.currentIndex < current.count - 1) {
		current.currentIndex++;
		current.answered = false;
		showCurrentQuestion();
	} else {
		// 最後の問題の場合は結果へ
		eventClickFinish(e);
	}
}

function eventClickPrev(e)
{
	e.preventDefault();
	
	if (current.currentIndex > 0) {
		current.currentIndex--;
		current.answered = false;
		showCurrentQuestion();
	}
}

function eventClickFinish(e)
{
	e.preventDefault();
	
	current.closed = true;

	// すべての問題を非表示
	$('#qroot').hide();
	$('#result').hide();
	$('#progress').hide();

	var percentage = Math.round(current.score*100/current.count);
	
	var div = $('<div/>');
	div.attr('id', 'score');
	
	// タイトル
	var title = $('<div/>').addClass('score-title').text('結果: ' + current.score + '/' + current.count + '問正解');
	div.append(title);
	
	// プログレスバーコンテナ
	var progressContainer = $('<div/>').addClass('progress-container');
	var progressBar = $('<div/>').addClass('progress-bar');
	progressBar.css('width', '0%');
	progressBar.attr('data-percentage', percentage);
	
	progressContainer.append(progressBar);
	div.append(progressContainer);
	
	// パーセンテージ表示（メーターの下）
	var progressText = $('<div/>').addClass('progress-text').text(percentage + '%');
	div.append(progressText);
	
	div.insertBefore('#navigator');
	
	// アニメーション効果
	setTimeout(function() {
		progressBar.css('width', percentage + '%');
	}, 100);

	$('#navigator').hide();
}

function updateNavigator()
{
	$('#navigator').empty();
	
	// 正解ボタン（上部）
	var btnAnswer = $('<button/>').addClass('nav-btn nav-btn-answer').text('正解');
	if (current.answered) {
		btnAnswer.prop('disabled', true);
	} else {
		btnAnswer.click(eventClickAnswer);
	}
	$('#navigator').append(btnAnswer);
	
	var navContainer = $('<div/>').addClass('nav-container');
	
	// もどるボタン
	var btnPrev = $('<button/>').addClass('nav-btn nav-btn-prev').text('← もどる');
	if (current.currentIndex === 0) {
		btnPrev.css('display', 'none');
	} else {
		btnPrev.click(eventClickPrev);
	}
	navContainer.append(btnPrev);
	
	// すすむボタン
	var btnNext = $('<button/>').addClass('nav-btn nav-btn-next').text('すすむ →');
	if (current.currentIndex === current.count - 1) {
		btnNext.text('結果を見る');
	}
	btnNext.click(eventClickNext);
	navContainer.append(btnNext);
	
	$('#navigator').append(navContainer);
}

function showCurrentQuestion()
{
	// すべての問題を非表示
	current.qs.hide();
	
	// 現在の問題のみ表示
	$(current.qs[current.currentIndex]).show();
	
	// 進捗表示を更新
	var progress = '問題 ' + (current.currentIndex + 1) + ' / ' + current.count;
	$('#progress').text(progress);
	
	// 結果表示をクリア
	$('#result').html('');
	
	// ボタンを更新
	updateNavigator();
}

function eventClickSaiten(e)
{
	// この関数は使用しません（一問一答形式では不要）
}





function startSection()
{
	current.closed = false;
	current.currentIndex = 0;
	current.score = 0;
	current.answered = false;
	
	current.qroot = current.target.find('div > ol'); // section root <OL>
	current.qs = current.qroot.find('> li'); // questions <LI>

	var s = current.target.find('h2').text() + ' (' + current.count + '問)';
	$('#description').text( s );

	// 問題をシャッフル
	var qs = shuffleArray(current.qs);

	// 各問題の選択肢をシャッフル
	for (var i = 0; i < qs.length; i++) {
		var ol = $(qs[i]).find('> ol');
		var li = ol.find('> li');

		li = shuffleArray( li );
		ol.append( li );

		// 各選択肢にイベントハンドラを登録する（li全体をクリック可能に）
		for (var j = 0; j < li.length; j++) {
			var tgt = $(li[j]);
			tgt.click(tgt, eventSelectOption);
			tgt.css('cursor', 'pointer');
		}

		ol.addClass('katakana'); // リストスタイルをカタカナにする
	}

	var ol = $('<ol/>').append(qs);
	ol.attr('id', 'qroot');
	$('body').append(ol);

	// 進捗表示
	var progress = $('<div/>');
	progress.attr('id', 'progress');
	progress.css({
		'text-align': 'center',
		'font-size': '14pt',
		'margin': '10px 0',
		'color': '#666'
	});
	$('body').append(progress);

	// 結果表示エリア
	var result = $('<div/>');
	result.attr('id', 'result');
	result.css({
		'text-align': 'center',
		'margin': '20px 0',
		'min-height': '30px'
	});
	$('body').append(result);

	// ナビゲーター
	var p = $('<p/>');
	p.attr('id', 'navigator');
	$('body').append(p);

	$('#menu').hide();
	
	// 最初の問題を表示
	showCurrentQuestion();
}


function initialize()
{
	var desc = $('<div/>');
	desc.attr('id', 'description');
	desc.text( $('meta[name="description"]').attr('content') );

	var menu = $('<div/>');
	menu.attr('id', 'menu');

	var ul = $('<ul/>');
	$('h2').each( function() {
		var li = $('<li/>');
		var a = $('<a/>').text( $(this).text() );

		a.attr('href', '#');
		a.click($(this).parent(), eventSelectMenu);

		var n = $(this).next().find('.sa, .ma').length;
		var span = $('<span/>').text(' (' + n + ')');

		li.append( a );
		li.append( span );
		ul.append( li );
	});

	var li = $('<li/>');
	var a = $('<a/>').text('模擬試験');
	a.attr('href', '#');
	a.click(eventSelectRandom50);
	li.append(a);
	li.append( $('<span/>').text(' (ランダムに50問選択)') );
	ul.append(li);

	menu.append(ul);

	$('body').append(desc);
	$('body').append(menu);
}


$(document).ready(function() {
	$('body > ol, p.e').hide();

	initialize();
});
