/*
--------------------------------------------------------
Input Suggest

入力補完を行うライブラリです。
使用方法、ライセンスについては、下記を参照してください。

http://www.enjoyxstudy.com/javascript/suggest

--------------------------------------------------------
- Enjyo×Study <http://www.enjoyxstudy.com>
--------------------------------------------------------

v0.1 2006/01/15
     ・公開
--------------------------------------------------------
*/

var IncSearch = {};

IncSearch.Suggest = Class.create();
IncSearch.Suggest.prototype = {
  initialize: function(input, suggestArea, candidateList) {
    this.input = $(input);
    this.suggestArea = $(suggestArea);
    this.candidateList = candidateList;

    this.oldText = this.input.value;

    if (arguments[3]) this.setOptions(arguments[3]);

    // reg event
    Event.observe(this.input, 'blur', this.blur.bindAsEventListener(this), false);
    Event.observe(this.input, 'keyup', this.keyup.bindAsEventListener(this), false);

    // init
    this.clearSuggestArea();

    // start checking...
    this.checkLoop();
  },

  // options
  interval: 500,
  dispMax: 20,
  isMatch: function(value, pattern) {
    return (value.indexOf(pattern) != -1);
  },
  activeDisplay: function(elm) {
    elm.style.backgroundColor = '#3366FF';
    elm.style.color = '#FFFFFF';
  },
  unactiveDisplay: function(elm) {
    elm.style.backgroundColor = '';
    elm.style.color = '';
  },
  moverDisplay: function(elm) {
    elm.style.backgroundColor = '#99CCFF';
    elm.style.color = '';
  },

  setOptions: function(options) {
    if (options.interval)
      this.interval = options.interval;

    if (options.dispMax)
      this.dispMax = options.dispMax;

    if (options.isMatch)
      this.isMatch = options.isMatch;

    if (options.activeDisplay)
      this.activeDisplay = options.activeDisplay;

    if (options.unactiveDisplay)
      this.unactiveDisplay = options.unactiveDisplay;

    if (options.moverDisplay)
      this.moverDisplay = options.moverDisplay;
  },

  checkLoop: function() {
    if (this.input.value != this.oldText) {
      this.oldText = this.input.value;
      this.search();
    }

    setTimeout(this.checkLoop.bind(this), this.interval);
  },

  // keydown/up
  keyup: function(event) {
    if (event.keyCode == Event.KEY_UP ||
        event.keyCode == Event.KEY_DOWN) {
      // key move
      this.moveActiveList(event.keyCode);
    }
  },

  search: function() {

    // init
    this.clearSuggestArea();

    if (this.input.value == '') return;

    var pattern = this.input.value;

    var resultList = new Array();

    for (var i = 0; i < this.candidateList.length; i++) {

      if (this.isMatch(this.candidateList[i], pattern)) {
        resultList.push(this.candidateList[i]);

        if (resultList.length >= this.dispMax) break;
      }
    }

    if (resultList != 0){
      this.createSuggestArea(resultList);
    }
  },

  clearSuggestArea: function() {
    this.suggestArea.innerHTML = '';
    this.suggestArea.style.display = 'none';
    this.suggestList = undefined;
    this.activePosition = undefined;
  },

  createSuggestArea: function(resultList) {

    this.suggestList = new Array();
    this.inputText = this.input.value;

    for (var i = 0; i < resultList.length; i++) {
      var elm = document.createElement('div');
      elm.innerHTML = resultList[i];
      this.suggestArea.appendChild(elm);

      Event.observe(elm, 'click',
        new Function('event', 'this.listClick(event, ' + i + ');').bindAsEventListener(this), false);
      Event.observe(elm, 'mouseover',
        new Function('event', 'this.listOver(event, ' + i + ');').bindAsEventListener(this), false);
      Event.observe(elm, 'mouseout',
        new Function('event', 'this.listOut(event, ' + i + ');').bindAsEventListener(this), false);

      this.suggestList.push(elm);
    }

    this.suggestArea.style.display = 'block';
  },

  moveActiveList: function(keyCode) {

    if (!this.suggestList ||
        this.suggestList.length == 0){
      return;
    }

    this.unactive();

    if (keyCode == Event.KEY_UP) {
      // up
      if (this.activePosition == undefined) return;

      this.activePosition--;
      if (this.activePosition < 0) {
        this.activePosition = 0;

        this.input.value = this.inputText;
        return;
      }
    }else{
      // down
      if (this.activePosition == undefined) {
        this.activePosition = 0;
      }else{
        this.activePosition++;
      }

      if (this.activePosition >= this.suggestList.length) {
        this.activePosition = this.suggestList.length -1;
      }
    }

    this.active(this.suggestList[this.activePosition]);
  },

  active: function(activeElement) {

    this.activeDisplay(activeElement);

    this.input.value = activeElement.innerHTML;
    this.oldText = this.input.value;
    this.input.focus();
  },

  unactive: function() {

    if (this.suggestList != undefined 
        && this.suggestList.length > 0
        && this.activePosition != undefined) {
      this.unactiveDisplay(this.suggestList[this.activePosition]);
    }
  },

  blur: function(event) {

    this.blurCancel = false;
    this.unactive();
    setTimeout((function(){ if (!this.blurCancel) this.clearSuggestArea(); }).bind(this), 500);
  },

  listClick: function(event, index) {

    this.blurCancel = true;
    var elm = Event.element(event);

    this.unactive();
    this.activePosition = index;
    this.active(elm);
  },

  listOver: function(event, index) {
    var elm = Event.element(event);
    this.moverDisplay(elm);
  },

  listOut: function(event, index) {

    var elm = Event.element(event);

    if (!this.suggestList) return;

    if (index == this.activePosition) {
      this.activeDisplay(elm);
    }else{
      this.unactiveDisplay(elm);
    }
  }
}
