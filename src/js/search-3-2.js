//===============================================================
//  フィルタテーブルの共通変数　設定要！
//===============================================================
var gTabldID = 'sampleTable';  // テーブルのエリアのIDを設定
var gTfStartRow = 0;
var gTfColList  = [];             // ボタンが配置されている列番号
var gTfListSave = {};             // フィルタリストの保存状態

//===============================================================
//  オンロードでテーブル初期設定関数をCALL
//===============================================================
window.onload = function() {
 tFilterInit();
}

function tFilterInit(){
//==============================================================
//  テーブルの初期設定
//==============================================================
 var wTABLE  = document.getElementById(gTabldID);
 var wTR     = wTABLE.rows;
 var wAddBtn = '';

 // ------------------------------------------------------------
 //   テーブル内をフィルタボタンを付ける
 // ------------------------------------------------------------
 for(var i=0; i < wTR.length; i++){

   var wTD     = wTABLE.rows[i].cells;

   for(var j=0; j < wTD.length; j++){

     // --- 「cmanFilterBtn」の定義があるセルを対象とする ------
     if(wTD[j].getAttribute('cmanFilterBtn') !== null){

       // --- フィルタ対象はボタンの次の行から -----------------
       gTfStartRow = i + 1;

       // --- ボタンを追加（画像はsvgを使用） ------------------
       wAddBtn  = '<div class="tfArea">';
       wAddBtn += '<svg class="tfImg" id="tsBtn_'+j+'" onclick="tFilterCloseOpen('+j+')"><path d="M0 0 L9 0 L6 4 L6 8 L3 8 L3 4Z"></path></svg>';
       wAddBtn += '<div class="tfList" id="tfList_'+j+'" style="display:none">';
       wAddBtn += tFilterCreate(j);
       wAddBtn += '</div>';
       wAddBtn += '</div>';
       wTD[j].innerHTML = wTD[j].innerHTML+wAddBtn;

       // --- フィルタボタンなる列を保存 -----------------------
       gTfColList.push(j);
     }
   }

   // --- ボタンを付けたら以降の行は無視する -------------------
   if(wAddBtn != ''){
     gSortBtnRow = i;
     break;
   }

 }
}

function tFilterCreate(argCol){
//==============================================================
//  指定列のフィルタリスト作成
//==============================================================

 var wTABLE    = document.getElementById(gTabldID);
 var wTR       = wTABLE.rows;
 var wItem     = [];              // クリックされた列の値
 var wNotNum   = 0;               // 1 : 数字でない
 var wItemSave = {};              // フィルタに設定した値がキー
 var rcList    = '';              // 返すフィルタリスト

 // ------------------------------------------------------------
 //  クリックされた列の値を取得する
 // ------------------------------------------------------------
 for(var i=gTfStartRow; i < wTR.length; i++){
   var j = i - gTfStartRow;

   wItem[j] = wTR[i].cells[argCol].innerText.toString();

   if(wItem[j].match(/^[-]?[0-9,\.]+$/)){
   }else{
       wNotNum = 1;
   }

 }

 // ------------------------------------------------------------
 //  列の値でソートを実行
 // ------------------------------------------------------------
   if(wNotNum == 0){
     wItem.sort(sortNumA);           // 数値で昇順
   }else{
     wItem.sort(sortStrA);           // 文字で昇順
   }

 // ------------------------------------------------------------
 //  「すべて」のチェックボックス作成
 // ------------------------------------------------------------
 var wItemId =  id='tfData_ALL_'+argCol;

 rcList += '<div class="tfMeisai">';
 rcList += '<input type="checkbox" id="'+wItemId+'" checked onclick="tFilterAllSet('+argCol+')">';
 rcList += '<label for="'+wItemId+'">(すべて)</label>';
 rcList += '</div>';

 // ------------------------------------------------------------
 //  列の値でフィルタのチェックボックスを作成する
 //    チェックボックスはformで囲む
 // ------------------------------------------------------------
 rcList += '<form name="tfForm_'+argCol+'">';

 for(var i=0; i < wItem.length; i++){

   wVal = trim(wItem[i]);

   if(wVal in wItemSave){
     // ---値でチェックボックスが作成されている(重複) ----------
   }else{

     // ---チェックボックスの作成 ------------------------------
     wItemId =  id='tfData_'+argCol+'_r'+i;
     rcList += '<div class="tfMeisai">';
     rcList += '<input type="checkbox" id="'+wItemId+'" value="'+wVal+'" checked onclick="tFilterClick('+argCol+')">';
     rcList += '<label for="'+wItemId+'">'+( wVal=='' ? '(空白)' : wVal )+'</label>';
     rcList += '</div>';

     // ---重複判定用にチェックボックスの値を保存 --------------
     wItemSave[wVal]='1';
   }
 }
 rcList += '</form>';

 // ------------------------------------------------------------
 //  文字抽出のinputを作成
 // ------------------------------------------------------------
 rcList += '<div class="tfInStr">';
 rcList += '<input type="text" placeholder="含む文字抽出" id="tfInStr_'+argCol+'">';
 rcList += '</div>';

 // ------------------------------------------------------------
 //  「OK」「Cancel」ボタンの作成
 // ------------------------------------------------------------
 rcList += '<div class="tfBtnArea">';
 rcList += '<input type="button" value="OK" onclick="tFilterGo()">';
 rcList += '<input type="button" value="Cancel" onclick="tFilterCancel('+argCol+')">';
 rcList += '</div>';

 // ------------------------------------------------------------
 //  作成したhtmlを返す
 // ------------------------------------------------------------
 return rcList;

}

function tFilterClick(argCol){
//==============================================================
//  フィルタリストのチェックボックスクリック
//    「すべて」のチェックボックスと整合性を合わせる
//==============================================================
 var wForm   = document.forms['tfForm_'+argCol];
 var wCntOn  = 0;
 var wCntOff = 0;
 var wAll    = document.getElementById('tfData_ALL_'+argCol);   // 「すべて」のチェックボックス

 // --- 各チェックボックスの状態を集計する ---------------------
 for (var i = 0; i < wForm.elements.length; i++){
   if(wForm.elements[i].type == 'checkbox'){
     if (wForm.elements[i].checked) { wCntOn++;  }
     else                           { wCntOff++; }
   }
 }

 // --- 各チェックボックス集計で「すべて」を整備する -----------
 if((wCntOn == 0)||(wCntOff == 0)){
   wAll.checked = true;             // 「すべて」をチェックする
   tFilterAllSet(argCol);           // 各フィルタのチェックする
 }else{
    wAll.checked = false;           // 「すべて」をチェックを外す
 }
}

function tFilterCancel(argCol){
//==============================================================
//  キャンセルボタン押下
//==============================================================

 tFilterSave(argCol, 'load');    // フィルタ条件の復元
 tFilterCloseOpen('');           // フィルタリストを閉じる

}

function tFilterGo(){
//===============================================================
//  フィルタの実行
//===============================================================
 var wTABLE  = document.getElementById(gTabldID);
 var wTR     = wTABLE.rows;

 // ------------------------------------------------------------
 //  全ての非表示を一旦クリア
 // ------------------------------------------------------------
 for(var i = 0; i < wTR.length; i++){
   if(wTR[i].getAttribute('cmanFilterNone') !== null){
     wTR[i].removeAttribute('cmanFilterNone');
   }
 }

 // ------------------------------------------------------------
 //  フィルタボタンのある列を繰り返す
 // ------------------------------------------------------------
 for(var wColList = 0; wColList < gTfColList.length; wColList++){
   var wCol       = gTfColList[wColList];
   var wAll       = document.getElementById('tfData_ALL_'+wCol);     // 「すべて」のチェックボックス
   var wItemSave  = {};
   var wFilterBtn =  document.getElementById('tsBtn_'+wCol);
   var wFilterStr =  document.getElementById('tfInStr_'+wCol);

   var wForm      = document.forms['tfForm_'+wCol];
   // -----------------------------------------------------------
   //  チェックボックスの整備（「すべて」の整合性）
   // -----------------------------------------------------------
   for (var i = 0; i < wForm.elements.length; i++){
     if(wForm.elements[i].type == 'checkbox'){
       if (wForm.elements[i].checked) {
         wItemSave[wForm.elements[i].value] = 1;      // チェックされている値を保存
       }
     }
   }

   // -----------------------------------------------------------
   //  フィルタ（非表示）の設定
   // -----------------------------------------------------------
   if((wAll.checked)&&(trim(wFilterStr.value) == '')){
     wFilterBtn.style.backgroundColor = '';              // フィルタなし色
   }
   else{
     wFilterBtn.style.backgroundColor = '#ffff00';       // フィルタあり色

     for(var i=gTfStartRow; i < wTR.length; i++){

       var wVal = trim(wTR[i].cells[wCol].innerText.toString());

       // --- チェックボックス選択によるフィルタ ----------------
       if(!wAll.checked){
         if(wVal in wItemSave){
         }
         else{
           wTR[i].setAttribute('cmanFilterNone','');
         }
       }

       // --- 抽出文字によるフィルタ ----------------------------
       if(wFilterStr.value != ''){
         reg = new RegExp(wFilterStr.value);
         if(wVal.match(reg)){
         }
         else{
           wTR[i].setAttribute('cmanFilterNone','');
         }
       }
     }
   }
 }

 tFilterCloseOpen('');
}

function tFilterSave(argCol, argFunc){
//==============================================================
//  フィルタリストの保存または復元
//==============================================================

 // ---「すべて」のチェックボックス値を保存 ------------------
 var wAllCheck = document.getElementById('tfData_ALL_'+argCol);
 if(argFunc == 'save'){
   gTfListSave[wAllCheck.id] = wAllCheck.checked;
 }else{
   wAllCheck.checked = gTfListSave[wAllCheck.id];
 }

 // --- 各チェックボックス値を保存 ---------------------------
 var wForm    = document.forms['tfForm_'+argCol];
 for (var i = 0; i < wForm.elements.length; i++){
   if(wForm.elements[i].type == 'checkbox'){
     if(argFunc == 'save'){
       gTfListSave[wForm.elements[i].id] = wForm.elements[i].checked;
     }else{
       wForm.elements[i].checked = gTfListSave[wForm.elements[i].id];
     }
   }
 }

 // --- 含む文字の入力を保存 ---------------------------------
 var wStrInput = document.getElementById('tfInStr_'+argCol);
 if(argFunc == 'save'){
   gTfListSave[wStrInput.id] = wStrInput.value;
 }else{
   wStrInput.value = gTfListSave[wStrInput.id];
 }
}

function tFilterCloseOpen(argCol){
//==============================================================
//  フィルタを閉じて開く
//==============================================================

 // --- フィルタリストを一旦すべて閉じる -----------------------
 for(var i=0; i < gTfColList.length; i++){
   document.getElementById("tfList_"+gTfColList[i]).style.display = 'none';
 }

 // --- 指定された列のフィルタリストを開く ---------------------
 if(argCol != ''){
   document.getElementById("tfList_"+argCol).style.display = '';

   // --- フィルタ条件の保存（キャンセル時に復元するため） -----
   tFilterSave(argCol, 'save');

 }
}

function tFilterAllSet(argCol){
//==============================================================
//  「すべて」のチェック状態に合わせて、各チェックをON/OFF
//==============================================================
 var wChecked = false;
 var wForm    = document.forms['tfForm_'+argCol];

 if(document.getElementById('tfData_ALL_'+argCol).checked){
   wChecked = true;
 }

 for (var i = 0; i < wForm.elements.length; i++){
   if(wForm.elements[i].type == 'checkbox'){
     wForm.elements[i].checked = wChecked;
   }
 }
}

function sortNumA(a, b) {
//==============================================================
//  数字のソート関数（昇順）
//==============================================================
 a = parseInt(a.replace(/,/g, ''));
 b = parseInt(b.replace(/,/g, ''));

 return a - b;
}

function sortStrA(a, b){
//==============================================================
//  文字のソート関数（昇順）
//==============================================================
 a = a.toString().toLowerCase();  // 英大文字小文字を区別しない
 b = b.toString().toLowerCase();

 if     (a < b){ return -1; }
 else if(a > b){ return  1; }
 return 0;
}

function trim(argStr){
//==============================================================
//  trim
//==============================================================
 var rcStr = argStr;
 rcStr	= rcStr.replace(/^[ 　\r\n]+/g, '');
 rcStr	= rcStr.replace(/[ 　\r\n]+$/g, '');
 return rcStr;
}

function viewChange(){
    if(document.getElementById('sample')){
        id = document.getElementById('sample').value;
        if(id == 'select1'){
            document.getElementById('Box1').style.display = "";
            document.getElementById('Box2').style.display = "none";
            document.getElementById('Box3').style.display = "none";
            document.getElementById('Box4').style.display = "none";
        }else if(id == 'select2'){
            document.getElementById('Box1').style.display = "none";
            document.getElementById('Box2').style.display = "";
            document.getElementById('Box3').style.display = "none";
            document.getElementById('Box4').style.display = "none";
        }
        else if(id == 'select3'){
            document.getElementById('Box1').style.display = "none";
            document.getElementById('Box2').style.display = "none";
            document.getElementById('Box3').style.display = "";
            document.getElementById('Box4').style.display = "none";
        }
        else if(id == 'select4'){
            document.getElementById('Box1').style.display = "none";
            document.getElementById('Box2').style.display = "none";
            document.getElementById('Box3').style.display = "none";
            document.getElementById('Box4').style.display = "";
        }
    }

window.onload = viewChange;
}

document.addEventListener('DOMContentLoaded', (event) => {
  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  var type = getParameterByName('type'); // ポケモン名
  //===================================================================
  //ここのnamesに「ポケモン名(fearyとか):'ポケモン名(日本語でフェアリーチャーム超とか）'」の形で入れてほしい
  //ポケモン名を設定
  var names = {
    feary:'フェアリーチャーム超',
    woro:'ウォロ',
    perusianGX:'ペルシアンGX',
    dadarin:'ダダリン',
    karuisi:'かるいし',
    faiya:'ファイヤー',
    messon:'メッソン',
    uotirudonV:'ウオチルドンV',
    aroranassiV:'アローラナッシーV',
    hisuibakuhun:'ヒスイバクフーン',
    fezaboru:'フェザーボール',
    katuranoippatushoubu:'カツラの一発勝負',
    suikunV:'スイクンV',
    susukimira:'ススキ(ミラー)',
    merumetaruGX:'メルメタルGX',
    erementarubazzi:'エレメンタルバッジ',
    nagi:'ナギ',
    obonnnomi:'オボンのみ',
    cherinbo:'チェリンボ',
    gararusanigo:'ガラルサニーゴ',
    kasutamukyattya:'カスタムキャッチャー',
    arorasandopan:'アローラサンドパン',
    hisuimarumainV:'ヒスイマルマインV',
    hihidaruma:'ヒヒダルマ',
    gaogaenEX:'ガオガエンEX',
    oisiimizusetto:'おいしいみずセット',
    yadoran:'ヤドラン',
    akagi:'アカギ◇',
    pokemontuusin:'ポケモン通信',
    eruhun:'エルフーン',
    bariyado:'バリヤード',
    jazzimanhoissuru:'ジャッジマンホイッスル',
    sirodesuna:'シロデスナ',
    magumadannnoguradon:'マグマ団のグラードン',
    neoranto:'ネオラント',
    pijotto:'ピジョット',
    gekkougaandzoroakuGX:'ゲッコウガ＆ゾロアークGX',
    rokettodannnomimikkyuGX:'ロケット団のミミッキュGX',
    makisi:'マキシ',
    baibanira:'バイバニラ',
    orizinparukiaVSTAR:'オリジンパルキアVSTAR',
    utugihakasenorekutya:'ウツギ博士のレクチャー',
    hurizaGX:'フリーザーGX',
    kosokumusi:'コソクムシ',
    pikatyuandzekuromuGX:'ピカチュウ＆ゼクロムGX',
    megasanaitoEX:'メガサーナイトEX',
    nidorannosu:'ニドラン♂',
    meresi:'メレシー',
    pattiragon:'パッチラゴン',
    hayasigame:'ハヤシガメ',
    meganiumu:'メガニウム',
    ruamojuru:'ルアーモジュール',
    appuryuVMAX:'アップリューVMAX',
    raiti:'ライチ',
    supaikutaun:'スパイクタウン',
    sattimusi:'サッチムシ',
    tatakko:'タタッコ',
    efi:'エーフィ',
    haganeruV:'ハガネールV',
    mantannnokusuri:'まんたんのくすり',
    matadogasu:'マタドガス',
    yunittoenerugi:'ユニットエネルギー草炎水',
    akeosu:'アーケオス',
    kyuremu:'キュレム',
    fione:'フィオネ',
    torunerosu:'トルネロス',
    girathina:'ギラティナV',
    serebi_ameizingurea:'セレビィ アメイジングレア',
    pijon:'ピジョン',
    marein:'マーレイン',
    supaboru:'スーパーボール',
    raityuGX:'ライチュウGX',
    zizironGX:'ジジーロンGX',
    purutoga:'プロトーガ',
    hupaV:'フーパV',
    aroragaragara:'アローラガラガラ',
    nyura:'ニューラ',
    kekenkani:'ケケンカニ',
    shakuya:'シャクヤ',
    kuitukusaretagenya:'喰いつくされた原野',
    masakinokaiseki:'マサキの解析',
    soratobupikatyuV:'そらをとぶピカチュウV',
    kurosusuittya:'クロススイッチャー',
    datenguGX:'ダーテングGX',
    yadon:'ヤドン',
    kyanpusetto:'キャンプセット',
    nyasu:'ニャース',
    uturoido:'ウツロイド',
    husigibanaV:'フシギバナV',
    ayasikandume:'妖しいカンヅメ',
    gureggurumira:'グレッグル(ミラー)',
    hikarumyu:'ひかるミュウ',
    toikyattya:'トイキャッチャー',
    yukikaburimira:'ユキカブリ(ミラー)',
    kimori:'キモリ',
    pureshasuboru:'プレシャスボール',
    dorapion:'ドラピオン',
    aserora:'アセロラ',
    jazziman:'ジャッジマン',
    bariyadomira:'バリヤード(ミラー)'
  };

  // typeに応じて新しいテキストを設定
  if (type && names[type]) {
    document.querySelector('.name p').textContent = names[type];
  }
//=======================================================================
  // 画像のパスを設定
 //ここのチャート(charts)、パターン(patterns)、今後の変動(arrows)の「''」に期間ごとに
 //「ポケモン名(fearyとか):'../img/**/~.png'」の形で入れてほしい
  //チャート
  var charts = {
   d30:{
    feary:'../img/charts/フェアリーチャーム超_30.png',
    woro:'../img/charts/ウォロ_30.png',
    perusianGX:'../img/charts/ペルシアンGX_30.png',
    dadarin:'../img/charts/ダダリン_30.png',
    karuisi:'../img/charts/かるいし_30.png',
    faiya:'../img/charts/ファイヤー_30.png',
    messon:'../img/charts/メッソン_30.png',
    uotirudonV:'../img/charts/ウオチルドンV_30.png',
    aroranassiV:'../img/charts/アローラナッシーV_30.png',
    hisuibakuhun:'../img/charts/ヒスイバクフーン_30.png',
    fezaboru:'../img/charts/フェザーボール_30.png',
    katuranoippatushoubu:'../img/charts/カツラの一発勝負_30.png',
    suikunV:'../img/charts/スイクンV_30.png',
    susukimira:'../img/charts/ススキ(ミラー)_30.png',
    merumetaruGX:'../img/charts/メルメタルGX_30.png',
    erementarubazzi:'../img/charts/エレメンタルバッジ_30.png',
    nagi:'../img/charts/ナギ_30.png',
    obonnnomi:'../img/charts/オボンのみ_30.png',
    cherinbo:'../img/charts/チェリンボ_30.png',
    gararusanigo:'../img/charts/ガラルサニーゴ_30.png',
    kasutamukyattya:'../img/charts/カスタムキャッチャー_30.png',
    arorasandopan:'../img/charts/アローラサンドパン_30.png',
    hisuimarumainV:'../img/charts/ヒスイマルマインV_30.png',
    hihidaruma:'../img/charts/ヒヒダルマ_30.png',
    gaogaenEX:'../img/charts/ガオガエンEX_30.png',
    oisiimizusetto:'../img/charts/おいしいみずセット_30.png',
    yadoran:'../img/charts/ヤドラン_30.png',
    akagi:'../img/charts/アカギ◇_30.png',
    pokemontuusin:'../img/charts/ポケモン通信_30.png',
    eruhun:'../img/charts/エルフーン_30.png',
    bariyado:'../img/charts/バリヤード_30.png',
    jazzimanhoissuru:'../img/charts/ジャッジマンホイッスル_30.png',
    sirodesuna:'../img/charts/シロデスナ_30.png',
    magumadannnoguradon:'../img/charts/マグマ団のグラードン_30.png',
    neoranto:'../img/charts/ネオラント_30.png',
    pijotto:'../img/charts/ピジョット_30.png',
    gekkougaandzoroakuGX:'../img/charts/ゲッコウガ＆ゾロアークGX_30.png',
    rokettodannnomimikkyuGX:'../img/charts/ロケット団のミミッキュGX_30.png',
    makisi:'../img/charts/マキシ_30.png',
    baibanira:'../img/charts/バイバニラ_30.png',
    orizinparukiaVSTAR:'../img/charts/オリジンパルキアVSTAR_30.png',
    utugihakasenorekutya:'../img/charts/ウツギ博士のレクチャー_30.png',
    hurizaGX:'../img/charts/フリーザーGX_30.png',
    kosokumusi:'../img/charts/コソクムシ_30.png',
    pikatyuandzekuromuGX:'../img/charts/ピカチュウ＆ゼクロムGX_30.png',
    megasanaitoEX:'../img/charts/メガサーナイトEX_30.png',
    nidorannosu:'../img/charts/ニドラン♂_30.png',
    meresi:'../img/charts/メレシー_30.png',
    pattiragon:'../img/charts/パッチラゴン_30.png',
    hayasigame:'../img/charts/ハヤシガメ_30.png',
    meganiumu:'../img/charts/メガニウム_30.png',
    ruamojuru:'../img/charts/ルアーモジュール_30.png',
    appuryuVMAX:'../img/charts/アップリューVMAX_30.png',
    raiti:'../img/charts/ライチ_30.png',
    supaikutaun:'../img/charts/スパイクタウン_30.png',
    sattimusi:'../img/charts/サッチムシ_30.png',
    tatakko:'../img/charts/タタッコ_30.png',
    efi:'../img/charts/エーフィ_30.png',
    haganeruV:'../img/charts/ハガネールV_30.png',
    mantannnokusuri:'../img/charts/まんたんのくすり_30.png',
    matadogasu:'../img/charts/マタドガス_30.png',
    yunittoenerugi:'../img/charts/ユニットエネルギー草炎水_30.png',
    akeosu:'../img/charts/アーケオス_30.png',
    kyuremu:'../img/charts/キュレム_30.png',
    fione:'../img/charts/フィオネ_30.png',
    torunerosu:'../img/charts/トルネロス_30.png',
    girathina:'../img/charts/ギラティナV_30.png',
    serebi_ameizingurea:'../img/charts/セレビィ アメイジングレア_30.png',
    pijon:'../img/charts/ピジョン_30.png',
    marein:'../img/charts/マーレイン_30.png',
    supaboru:'../img/charts/スーパーボール_30.png',
    raityuGX:'../img/charts/ライチュウGX_30.png',
    zizironGX:'../img/charts/ジジーロンGX_30.png',
    purutoga:'../img/charts/プロトーガ_30.png',
    hupaV:'../img/charts/フーパV_30.png',
    aroragaragara:'../img/charts/アローラガラガラ_30.png',
    nyura:'../img/charts/ニューラ_30.png',
    kekenkani:'../img/charts/ケケンカニ_30.png',
    shakuya:'../img/charts/シャクヤ_30.png',
    kuitukusaretagenya:'../img/charts/喰いつくされた原野_30.png',
    masakinokaiseki:'../img/charts/マサキの解析_30.png',
    soratobupikatyuV:'../img/charts/そらをとぶピカチュウV_30.png',
    kurosusuittya:'../img/charts/クロススイッチャー_30.png',
    datenguGX:'../img/charts/ダーテングGX_30.png',
    yadon:'../img/charts/ヤドン_30.png',
    kyanpusetto:'../img/charts/キャンプセット_30.png',
    nyasu:'../img/charts/ニャース_30.png',
    uturoido:'../img/charts/ウツロイド_30.png',
    husigibanaV:'../img/charts/フシギバナV_30.png',
    ayasikandume:'../img/charts/妖しいカンヅメ_30.png',
    gureggurumira:'../img/charts/グレッグル(ミラー)_30.png',
    hikarumyu:'../img/charts/ひかるミュウ_30.png',
    toikyattya:'../img/charts/トイキャッチャー_30.png',
    yukikaburimira:'../img/charts/ユキカブリ(ミラー)_30.png',
    kimori:'../img/charts/キモリ_30.png',
    pureshasuboru:'../img/charts/プレシャスボール_30.png',
    dorapion:'../img/charts/ドラピオン_30.png',
    aserora:'../img/charts/アセロラ_30.png',
    jazziman:'../img/charts/ジャッジマン_30.png',
    bariyadomira:'../img/charts/バリヤード(ミラー)_30.png'
  },
   d60:{
    feary:'../img/charts/フェアリーチャーム超_60.png',
    woro:'../img/charts/ウォロ_60.png',
    perusianGX:'../img/charts/ペルシアンGX_60.png',
    dadarin:'../img/charts/ダダリン_60.png',
    karuisi:'../img/charts/かるいし_60.png',
    faiya:'../img/charts/ファイヤー_60.png',
    messon:'../img/charts/メッソン_60.png',
    uotirudonV:'../img/charts/ウオチルドンV_60.png',
    aroranassiV:'../img/charts/アローラナッシーV_60.png',
    hisuibakuhun:'../img/charts/ヒスイバクフーン_60.png',
    fezaboru:'../img/charts/フェザーボール_60.png',
    katuranoippatushoubu:'../img/charts/カツラの一発勝負_60.png',
    suikunV:'../img/charts/スイクンV_60.png',
    susukimira:'../img/charts/ススキ(ミラー)_60.png',
    merumetaruGX:'../img/charts/メルメタルGX_60.png',
    erementarubazzi:'../img/charts/エレメンタルバッジ_60.png',
    nagi:'../img/charts/ナギ_60.png',
    obonnnomi:'../img/charts/オボンのみ_60.png',
    cherinbo:'../img/charts/チェリンボ_60.png',
    gararusanigo:'../img/charts/ガラルサニーゴ_60.png',
    kasutamukyattya:'../img/charts/カスタムキャッチャー_60.png',
    arorasandopan:'../img/charts/アローラサンドパン_60.png',
    hisuimarumainV:'../img/charts/ヒスイマルマインV_60.png',
    hihidaruma:'../img/charts/ヒヒダルマ_60.png',
    gaogaenEX:'../img/charts/ガオガエンEX_60.png',
    oisiimizusetto:'../img/charts/おいしいみずセット_60.png',
    yadoran:'../img/charts/ヤドラン_60.png',
    akagi:'../img/charts/アカギ◇_60.png',
    pokemontuusin:'../img/charts/ポケモン通信_60.png',
    eruhun:'../img/charts/エルフーン_60.png',
    bariyado:'../img/charts/バリヤード_60.png',
    jazzimanhoissuru:'../img/charts/ジャッジマンホイッスル_60.png',
    sirodesuna:'../img/charts/シロデスナ_60.png',
    magumadannnoguradon:'../img/charts/マグマ団のグラードン_60.png',
    neoranto:'../img/charts/ネオラント_60.png',
    pijotto:'../img/charts/ピジョット_60.png',
    gekkougaandzoroakuGX:'../img/charts/ゲッコウガ＆ゾロアークGX_60.png',
    rokettodannnomimikkyuGX:'../img/charts/ロケット団のミミッキュGX_60.png',
    makisi:'../img/charts/マキシ_60.png',
    baibanira:'../img/charts/バイバニラ_60.png',
    orizinparukiaVSTAR:'../img/charts/オリジンパルキアVSTAR_60.png',
    utugihakasenorekutya:'../img/charts/ウツギ博士のレクチャー_60.png',
    hurizaGX:'../img/charts/フリーザーGX_60.png',
    kosokumusi:'../img/charts/コソクムシ_60.png',
    pikatyuandzekuromuGX:'../img/charts/ピカチュウ＆ゼクロムGX_60.png',
    megasanaitoEX:'../img/charts/メガサーナイトEX_60.png',
    nidorannosu:'../img/charts/ニドラン♂_60.png',
    meresi:'../img/charts/メレシー_60.png',
    pattiragon:'../img/charts/パッチラゴン_60.png',
    hayasigame:'../img/charts/ハヤシガメ_60.png',
    meganiumu:'../img/charts/メガニウム_60.png',
    ruamojuru:'../img/charts/ルアーモジュール_60.png',
    appuryuVMAX:'../img/charts/アップリューVMAX_60.png',
    raiti:'../img/charts/ライチ_60.png',
    supaikutaun:'../img/charts/スパイクタウン_60.png',
    sattimusi:'../img/charts/サッチムシ_60.png',
    tatakko:'../img/charts/タタッコ_60.png',
    efi:'../img/charts/エーフィ_60.png',
    haganeruV:'../img/charts/ハガネールV_60.png',
    mantannnokusuri:'../img/charts/まんたんのくすり_60.png',
    matadogasu:'../img/charts/マタドガス_60.png',
    yunittoenerugi:'../img/charts/ユニットエネルギー草炎水_60.png',
    akeosu:'../img/charts/アーケオス_60.png',
    kyuremu:'../img/charts/キュレム_60.png',
    fione:'../img/charts/フィオネ_60.png',
    torunerosu:'../img/charts/トルネロス_60.png',
    girathina:'../img/charts/ギラティナV_60.png',
    serebi_ameizingurea:'../img/charts/セレビィ アメイジングレア_60.png',
    pijon:'../img/charts/ピジョン_60.png',
    marein:'../img/charts/マーレイン_60.png',
    supaboru:'../img/charts/スーパーボール_60.png',
    raityuGX:'../img/charts/ライチュウGX_60.png',
    zizironGX:'../img/charts/ジジーロンGX_60.png',
    purutoga:'../img/charts/プロトーガ_60.png',
    hupaV:'../img/charts/フーパV_60.png',
    aroragaragara:'../img/charts/アローラガラガラ_60.png',
    nyura:'../img/charts/ニューラ_60.png',
    kekenkani:'../img/charts/ケケンカニ_60.png',
    shakuya:'../img/charts/シャクヤ_60.png',
    kuitukusaretagenya:'../img/charts/喰いつくされた原野_60.png',
    masakinokaiseki:'../img/charts/マサキの解析_60.png',
    soratobupikatyuV:'../img/charts/そらをとぶピカチュウV_60.png',
    kurosusuittya:'../img/charts/クロススイッチャー_60.png',
    datenguGX:'../img/charts/ダーテングGX_60.png',
    yadon:'../img/charts/ヤドン_60.png',
    kyanpusetto:'../img/charts/キャンプセット_60.png',
    nyasu:'../img/charts/ニャース_60.png',
    uturoido:'../img/charts/ウツロイド_60.png',
    husigibanaV:'../img/charts/フシギバナV_60.png',
    ayasikandume:'../img/charts/妖しいカンヅメ_60.png',
    gureggurumira:'../img/charts/グレッグル(ミラー)_60.png',
    hikarumyu:'../img/charts/ひかるミュウ_60.png',
    toikyattya:'../img/charts/トイキャッチャー_60.png',
    yukikaburimira:'../img/charts/ユキカブリ(ミラー)_60.png',
    kimori:'../img/charts/キモリ_60.png',
    pureshasuboru:'../img/charts/プレシャスボール_60.png',
    dorapion:'../img/charts/ドラピオン_60.png',
    aserora:'../img/charts/アセロラ_60.png',
    jazziman:'../img/charts/ジャッジマン_60.png',
    bariyadomira:'../img/charts/バリヤード(ミラー)_60.png'
  },
   d180:{
    feary:'../img/charts/フェアリーチャーム超_180.png',
    woro:'../img/charts/ウォロ_180.png',
    perusianGX:'../img/charts/ペルシアンGX_180.png',
    dadarin:'../img/charts/ダダリン_180.png',
    karuisi:'../img/charts/かるいし_180.png',
    faiya:'../img/charts/ファイヤー_180.png',
    messon:'../img/charts/メッソン_180.png',
    uotirudonV:'../img/charts/ウオチルドンV_180.png',
    aroranassiV:'../img/charts/アローラナッシーV_180.png',
    hisuibakuhun:'../img/charts/ヒスイバクフーン_180.png',
    fezaboru:'../img/charts/フェザーボール_180.png',
    katuranoippatushoubu:'../img/charts/カツラの一発勝負_180.png',
    suikunV:'../img/charts/スイクンV_180.png',
    susukimira:'../img/charts/ススキ(ミラー)_180.png',
    merumetaruGX:'../img/charts/メルメタルGX_180.png',
    erementarubazzi:'../img/charts/エレメンタルバッジ_180.png',
    nagi:'../img/charts/ナギ_180.png',
    obonnnomi:'../img/charts/オボンのみ_180.png',
    cherinbo:'../img/charts/チェリンボ_180.png',
    gararusanigo:'../img/charts/ガラルサニーゴ_180.png',
    kasutamukyattya:'../img/charts/カスタムキャッチャー_180.png',
    arorasandopan:'../img/charts/アローラサンドパン_180.png',
    hisuimarumainV:'../img/charts/ヒスイマルマインV_180.png',
    hihidaruma:'../img/charts/ヒヒダルマ_180.png',
    gaogaenEX:'../img/charts/ガオガエンEX_180.png',
    oisiimizusetto:'../img/charts/おいしいみずセット_180.png',
    yadoran:'../img/charts/ヤドラン_180.png',
    akagi:'../img/charts/アカギ◇_180.png',
    pokemontuusin:'../img/charts/ポケモン通信_180.png',
    eruhun:'../img/charts/エルフーン_180.png',
    bariyado:'../img/charts/バリヤード_180.png',
    jazzimanhoissuru:'../img/charts/ジャッジマンホイッスル_180.png',
    sirodesuna:'../img/charts/シロデスナ_180.png',
    magumadannnoguradon:'../img/charts/マグマ団のグラードン_180.png',
    neoranto:'../img/charts/ネオラント_180.png',
    pijotto:'../img/charts/ピジョット_180.png',
    gekkougaandzoroakuGX:'../img/charts/ゲッコウガ＆ゾロアークGX_180.png',
    rokettodannnomimikkyuGX:'../img/charts/ロケット団のミミッキュGX_180.png',
    makisi:'../img/charts/マキシ_180.png',
    baibanira:'../img/charts/バイバニラ_180.png',
    orizinparukiaVSTAR:'../img/charts/オリジンパルキアVSTAR_180.png',
    utugihakasenorekutya:'../img/charts/ウツギ博士のレクチャー_180.png',
    hurizaGX:'../img/charts/フリーザーGX_180.png',
    kosokumusi:'../img/charts/コソクムシ_180.png',
    pikatyuandzekuromuGX:'../img/charts/ピカチュウ＆ゼクロムGX_180.png',
    megasanaitoEX:'../img/charts/メガサーナイトEX_180.png',
    nidorannosu:'../img/charts/ニドラン♂_180.png',
    meresi:'../img/charts/メレシー_180.png',
    pattiragon:'../img/charts/パッチラゴン_180.png',
    hayasigame:'../img/charts/ハヤシガメ_180.png',
    meganiumu:'../img/charts/メガニウム_180.png',
    ruamojuru:'../img/charts/ルアーモジュール_180.png',
    appuryuVMAX:'../img/charts/アップリューVMAX_180.png',
    raiti:'../img/charts/ライチ_180.png',
    supaikutaun:'../img/charts/スパイクタウン_180.png',
    sattimusi:'../img/charts/サッチムシ_180.png',
    tatakko:'../img/charts/タタッコ_180.png',
    efi:'../img/charts/エーフィ_180.png',
    haganeruV:'../img/charts/ハガネールV_180.png',
    mantannnokusuri:'../img/charts/まんたんのくすり_180.png',
    matadogasu:'../img/charts/マタドガス_180.png',
    yunittoenerugi:'../img/charts/ユニットエネルギー草炎水_180.png',
    akeosu:'../img/charts/アーケオス_180.png',
    kyuremu:'../img/charts/キュレム_180.png',
    fione:'../img/charts/フィオネ_180.png',
    torunerosu:'../img/charts/トルネロス_180.png',
    girathina:'../img/charts/ギラティナV_180.png',
    serebi_ameizingurea:'../img/charts/セレビィ アメイジングレア_180.png',
    pijon:'../img/charts/ピジョン_180.png',
    marein:'../img/charts/マーレイン_180.png',
    supaboru:'../img/charts/スーパーボール_180.png',
    raityuGX:'../img/charts/ライチュウGX_180.png',
    zizironGX:'../img/charts/ジジーロンGX_180.png',
    purutoga:'../img/charts/プロトーガ_180.png',
    hupaV:'../img/charts/フーパV_180.png',
    aroragaragara:'../img/charts/アローラガラガラ_180.png',
    nyura:'../img/charts/ニューラ_180.png',
    kekenkani:'../img/charts/ケケンカニ_180.png',
    shakuya:'../img/charts/シャクヤ_180.png',
    kuitukusaretagenya:'../img/charts/喰いつくされた原野_180.png',
    masakinokaiseki:'../img/charts/マサキの解析_180.png',
    soratobupikatyuV:'../img/charts/そらをとぶピカチュウV_180.png',
    kurosusuittya:'../img/charts/クロススイッチャー_180.png',
    datenguGX:'../img/charts/ダーテングGX_180.png',
    yadon:'../img/charts/ヤドン_180.png',
    kyanpusetto:'../img/charts/キャンプセット_180.png',
    nyasu:'../img/charts/ニャース_180.png',
    uturoido:'../img/charts/ウツロイド_180.png',
    husigibanaV:'../img/charts/フシギバナV_180.png',
    ayasikandume:'../img/charts/妖しいカンヅメ_180.png',
    gureggurumira:'../img/charts/グレッグル(ミラー)_180.png',
    hikarumyu:'../img/charts/ひかるミュウ_180.png',
    toikyattya:'../img/charts/トイキャッチャー_180.png',
    yukikaburimira:'../img/charts/ユキカブリ(ミラー)_180.png',
    kimori:'../img/charts/キモリ_180.png',
    pureshasuboru:'../img/charts/プレシャスボール_180.png',
    dorapion:'../img/charts/ドラピオン_180.png',
    aserora:'../img/charts/アセロラ_180.png',
    jazziman:'../img/charts/ジャッジマン_180.png',
    bariyadomira:'../img/charts/バリヤード(ミラー)_180.png'
  },
   d365:{
    feary:'../img/charts/フェアリーチャーム超_365.png',
    woro:'../img/charts/ウォロ_365.png',
    perusianGX:'../img/charts/ペルシアンGX_365.png',
    dadarin:'../img/charts/ダダリン_365.png',
    karuisi:'../img/charts/かるいし_365.png',
    faiya:'../img/charts/ファイヤー_365.png',
    messon:'../img/charts/メッソン_365.png',
    uotirudonV:'../img/charts/ウオチルドンV_365.png',
    aroranassiV:'../img/charts/アローラナッシーV_365.png',
    hisuibakuhun:'../img/charts/ヒスイバクフーン_365.png',
    fezaboru:'../img/charts/フェザーボール_365.png',
    katuranoippatushoubu:'../img/charts/カツラの一発勝負_365.png',
    suikunV:'../img/charts/スイクンV_365.png',
    susukimira:'../img/charts/ススキ(ミラー)_365.png',
    merumetaruGX:'../img/charts/メルメタルGX_365.png',
    erementarubazzi:'../img/charts/エレメンタルバッジ_365.png',
    nagi:'../img/charts/ナギ_365.png',
    obonnnomi:'../img/charts/オボンのみ_365.png',
    cherinbo:'../img/charts/チェリンボ_365.png',
    gararusanigo:'../img/charts/ガラルサニーゴ_365.png',
    kasutamukyattya:'../img/charts/カスタムキャッチャー_365.png',
    arorasandopan:'../img/charts/アローラサンドパン_365.png',
    hisuimarumainV:'../img/charts/ヒスイマルマインV_365.png',
    hihidaruma:'../img/charts/ヒヒダルマ_365.png',
    gaogaenEX:'../img/charts/ガオガエンEX_365.png',
    oisiimizusetto:'../img/charts/おいしいみずセット_365.png',
    yadoran:'../img/charts/ヤドラン_365.png',
    akagi:'../img/charts/アカギ◇_365.png',
    pokemontuusin:'../img/charts/ポケモン通信_365.png',
    eruhun:'../img/charts/エルフーン_365.png',
    bariyado:'../img/charts/バリヤード_365.png',
    jazzimanhoissuru:'../img/charts/ジャッジマンホイッスル_365.png',
    sirodesuna:'../img/charts/シロデスナ_365.png',
    magumadannnoguradon:'../img/charts/マグマ団のグラードン_365.png',
    neoranto:'../img/charts/ネオラント_365.png',
    pijotto:'../img/charts/ピジョット_365.png',
    gekkougaandzoroakuGX:'../img/charts/ゲッコウガ＆ゾロアークGX_365.png',
    rokettodannnomimikkyuGX:'../img/charts/ロケット団のミミッキュGX_365.png',
    makisi:'../img/charts/マキシ_365.png',
    baibanira:'../img/charts/バイバニラ_365.png',
    orizinparukiaVSTAR:'../img/charts/オリジンパルキアVSTAR_365.png',
    utugihakasenorekutya:'../img/charts/ウツギ博士のレクチャー_365.png',
    hurizaGX:'../img/charts/フリーザーGX_365.png',
    kosokumusi:'../img/charts/コソクムシ_365.png',
    pikatyuandzekuromuGX:'../img/charts/ピカチュウ＆ゼクロムGX_365.png',
    megasanaitoEX:'../img/charts/メガサーナイトEX_365.png',
    nidorannosu:'../img/charts/ニドラン♂_365.png',
    meresi:'../img/charts/メレシー_365.png',
    pattiragon:'../img/charts/パッチラゴン_365.png',
    hayasigame:'../img/charts/ハヤシガメ_365.png',
    meganiumu:'../img/charts/メガニウム_365.png',
    ruamojuru:'../img/charts/ルアーモジュール_365.png',
    appuryuVMAX:'../img/charts/アップリューVMAX_365.png',
    raiti:'../img/charts/ライチ_365.png',
    supaikutaun:'../img/charts/スパイクタウン_365.png',
    sattimusi:'../img/charts/サッチムシ_365.png',
    tatakko:'../img/charts/タタッコ_365.png',
    efi:'../img/charts/エーフィ_365.png',
    haganeruV:'../img/charts/ハガネールV_365.png',
    mantannnokusuri:'../img/charts/まんたんのくすり_365.png',
    matadogasu:'../img/charts/マタドガス_365.png',
    yunittoenerugi:'../img/charts/ユニットエネルギー草炎水_365.png',
    akeosu:'../img/charts/アーケオス_365.png',
    kyuremu:'../img/charts/キュレム_365.png',
    fione:'../img/charts/フィオネ_365.png',
    torunerosu:'../img/charts/トルネロス_365.png',
    girathina:'../img/charts/ギラティナV_365.png',
    serebi_ameizingurea:'../img/charts/セレビィ アメイジングレア_365.png',
    pijon:'../img/charts/ピジョン_365.png',
    marein:'../img/charts/マーレイン_365.png',
    supaboru:'../img/charts/スーパーボール_365.png',
    raityuGX:'../img/charts/ライチュウGX_365.png',
    zizironGX:'../img/charts/ジジーロンGX_365.png',
    purutoga:'../img/charts/プロトーガ_365.png',
    hupaV:'../img/charts/フーパV_365.png',
    aroragaragara:'../img/charts/アローラガラガラ_365.png',
    nyura:'../img/charts/ニューラ_365.png',
    kekenkani:'../img/charts/ケケンカニ_365.png',
    shakuya:'../img/charts/シャクヤ_365.png',
    kuitukusaretagenya:'../img/charts/喰いつくされた原野_365.png',
    masakinokaiseki:'../img/charts/マサキの解析_365.png',
    soratobupikatyuV:'../img/charts/そらをとぶピカチュウV_365.png',
    kurosusuittya:'../img/charts/クロススイッチャー_365.png',
    datenguGX:'../img/charts/ダーテングGX_365.png',
    yadon:'../img/charts/ヤドン_365.png',
    kyanpusetto:'../img/charts/キャンプセット_365.png',
    nyasu:'../img/charts/ニャース_365.png',
    uturoido:'../img/charts/ウツロイド_365.png',
    husigibanaV:'../img/charts/フシギバナV_365.png',
    ayasikandume:'../img/charts/妖しいカンヅメ_365.png',
    gureggurumira:'../img/charts/グレッグル(ミラー)_365.png',
    hikarumyu:'../img/charts/ひかるミュウ_365.png',
    toikyattya:'../img/charts/トイキャッチャー_365.png',
    yukikaburimira:'../img/charts/ユキカブリ(ミラー)_365.png',
    kimori:'../img/charts/キモリ_365.png',
    pureshasuboru:'../img/charts/プレシャスボール_365.png',
    dorapion:'../img/charts/ドラピオン_365.png',
    aserora:'../img/charts/アセロラ_365.png',
    jazziman:'../img/charts/ジャッジマン_365.png',
    bariyadomira:'../img/charts/バリヤード(ミラー)_365.png'
   }
  };
  var patterns = {
   d30:{
    feary:'../img/patterns/もみ合い.png',
    woro:'../img/patterns/もみ合い.png',
    perusianGX:'../img/patterns/下げ止まり.png',
    dadarin:'../img/patterns/下げ止まり.png',
    karuisi:'../img/patterns/下げ止まり.png',
    faiya:'../img/patterns/下げ止まり.png',
    messon:'../img/patterns/急落.png',
    uotirudonV:'../img/patterns/もみ合い.png',
    aroranassiV:'../img/patterns/もみ合い.png',
    hisuibakuhun:'../img/patterns/下げ止まり.png',
    fezaboru:'../img/patterns/もみ合い.png',
    katuranoippatushoubu:'../img/patterns/下げ止まり.png',
    suikunV:'../img/patterns/下げ止まり.png',
    susukimira:'../img/patterns/もみ合い.png',
    merumetaruGX:'../img/patterns/上昇.png',
    erementarubazzi:'../img/patterns/下げ止まり.png',
    nagi:'../img/patterns/上昇ストップ.png',
    obonnnomi:'../img/patterns/上昇ストップ.png',
    cherinbo:'../img/patterns/下降.png',
    gararusanigo:'../img/patterns/もみ合い.png',
    kasutamukyattya:'../img/patterns/上昇ストップ.png',
    arorasandopan:'../img/patterns/下げ止まり.png',
    hisuimarumainV:'../img/patterns/上昇.png',
    hihidaruma:'../img/patterns/下げ止まり.png',
    gaogaenEX:'../img/patterns/上昇ストップ.png',
    oisiimizusetto:'../img/patterns/もみ合い.png',
    yadoran:'../img/patterns/下げ止まり.png',
    akagi:'../img/patterns/下げ止まり.png',
    pokemontuusin:'../img/patterns/下げ止まり.png',
    eruhun:'../img/patterns/下げ止まり.png',
    bariyado:'../img/patterns/もみ合い.png',
    jazzimanhoissuru:'../img/patterns/下げ止まり.png',
    sirodesuna:'../img/patterns/下げ止まり.png',
    magumadannnoguradon:'../img/patterns/下げ止まり.png',
    neoranto:'../img/patterns/もみ合い.png',
    pijotto:'../img/patterns/上昇ストップ.png',
    gekkougaandzoroakuGX:'../img/patterns/下降.png',
    rokettodannnomimikkyuGX:'../img/patterns/もみ合い.png',
    makisi:'../img/patterns/上昇.png',
    baibanira:'../img/patterns/もみ合い.png',
    orizinparukiaVSTAR:'../img/patterns/下げ止まり.png',
    utugihakasenorekutya:'../img/patterns/下げ止まり.png',
    hurizaGX:'../img/patterns/下げ止まり.png',
    kosokumusi:'../img/patterns/下げ止まり.png',
    pikatyuandzekuromuGX:'../img/patterns/下げ止まり.png',
    megasanaitoEX:'../img/patterns/上昇ストップ.png',
    nidorannosu:'../img/patterns/下げ止まり.png',
    meresi:'../img/patterns/上昇ストップ.png',
    pattiragon:'../img/patterns/下げ止まり.png',
    hayasigame:'../img/patterns/下げ止まり.png',
    meganiumu:'../img/patterns/上昇.png',
    ruamojuru:'../img/patterns/もみ合い.png',
    appuryuVMAX:'../img/patterns/もみ合い.png',
    raiti:'../img/patterns/上昇.png',
    supaikutaun:'../img/patterns/上昇ストップ.png',
    sattimusi:'../img/patterns/下げ止まり.png',
    tatakko:'../img/patterns/下げ止まり.png',
    efi:'../img/patterns/下げ止まり.png',
    haganeruV:'../img/patterns/急上昇.png',
    mantannnokusuri:'../img/patterns/下げ止まり.png',
    matadogasu:'../img/patterns/上昇.png',
    yunittoenerugi:'../img/patterns/下降.png',
    akeosu:'../img/patterns/もみ合い.png',
    kyuremu:'../img/patterns/もみ合い.png',
    fione:'../img/patterns/下げ止まり.png',
    torunerosu:'../img/patterns/もみ合い.png',
    girathina:'../img/patterns/調整.png',
    serebi_ameizingurea:'../img/patterns/もみ合い.png',
    pijon:'../img/patterns/上昇ストップ.png',
    marein:'../img/patterns/上昇.png',
    supaboru:'../img/patterns/下げ止まり.png',
    raityuGX:'../img/patterns/もみ合い.png',
    zizironGX:'../img/patterns/急落.png',
    purutoga:'../img/patterns/上昇ストップ.png',
    hupaV:'../img/patterns/下げ止まり.png',
    aroragaragara:'../img/patterns/もみ合い.png',
    nyura:'../img/patterns/下げ止まり.png',
    kekenkani:'../img/patterns/下げ止まり.png',
    shakuya:'../img/patterns/下降.png',
    kuitukusaretagenya:'../img/patterns/下げ止まり.png',
    masakinokaiseki:'../img/patterns/上昇ストップ.png',
    soratobupikatyuV:'../img/patterns/下げ止まり.png',
    kurosusuittya:'../img/patterns/もみ合い.png',
    datenguGX:'../img/patterns/上昇.png',
    yadon:'../img/patterns/下げ止まり.png',
    kyanpusetto:'../img/patterns/もみ合い.png',
    nyasu:'../img/patterns/もみ合い.png',
    uturoido:'../img/patterns/急上昇.png',
    husigibanaV:'../img/patterns/下降.png',
    ayasikandume:'../img/patterns/下げ止まり.png',
    gureggurumira:'../img/patterns/もみ合い.png',
    hikarumyu:'../img/patterns/上昇ストップ.png',
    toikyattya:'../img/patterns/もみ合い.png',
    yukikaburimira:'../img/patterns/もみ合い.png',
    kimori:'../img/patterns/もみ合い.png',
    pureshasuboru:'../img/patterns/もみ合い.png',
    dorapion:'../img/patterns/もみ合い.png',
    aserora:'../img/patterns/下げ止まり.png',
    jazziman:'../img/patterns/下げ止まり.png',
    bariyadomira:'../img/patterns/上昇.png'
  },
   d60:{
    feary:'../img/patterns/下げ止まり.png',
    woro:'../img/patterns/もみ合い.png',
    perusianGX:'../img/patterns/急落.png',
    dadarin:'../img/patterns/下降.png',
    karuisi:'../img/patterns/下降.png',
    faiya:'../img/patterns/調整.png',
    messon:'../img/patterns/急落.png',
    uotirudonV:'../img/patterns/もみ合い.png',
    aroranassiV:'../img/patterns/下げ止まり.png',
    hisuibakuhun:'../img/patterns/下降.png',
    fezaboru:'../img/patterns/もみ合い.png',
    katuranoippatushoubu:'../img/patterns/急落.png',
    suikunV:'../img/patterns/急落.png',
    susukimira:'../img/patterns/下げ止まり.png',
    merumetaruGX:'../img/patterns/下げ止まり.png',
    erementarubazzi:'../img/patterns/下降.png',
    nagi:'../img/patterns/下げ止まり.png',
    obonnnomi:'../img/patterns/リバウンド.png',
    cherinbo:'../img/patterns/下降.png',
    gararusanigo:'../img/patterns/急上昇.png',
    kasutamukyattya:'../img/patterns/上昇.png',
    arorasandopan:'../img/patterns/急落.png',
    hisuimarumainV:'../img/patterns/リバウンド.png',
    hihidaruma:'../img/patterns/下降.png',
    gaogaenEX:'../img/patterns/上昇ストップ.png',
    oisiimizusetto:'../img/patterns/下げ止まり.png',
    yadoran:'../img/patterns/急落.png',
    akagi:'../img/patterns/下降.png',
    pokemontuusin:'../img/patterns/急落.png',
    eruhun:'../img/patterns/急落.png',
    bariyado:'../img/patterns/もみ合い.png',
    jazzimanhoissuru:'../img/patterns/調整.png',
    sirodesuna:'../img/patterns/下降.png',
    magumadannnoguradon:'../img/patterns/調整.png',
    neoranto:'../img/patterns/上昇.png',
    pijotto:'../img/patterns/急上昇.png',
    gekkougaandzoroakuGX:'../img/patterns/急落.png',
    rokettodannnomimikkyuGX:'../img/patterns/もみ合い.png',
    makisi:'../img/patterns/急上昇.png',
    baibanira:'../img/patterns/下げ止まり.png',
    orizinparukiaVSTAR:'../img/patterns/下降.png',
    utugihakasenorekutya:'../img/patterns/下げ止まり.png',
    hurizaGX:'../img/patterns/急落.png',
    kosokumusi:'../img/patterns/急落.png',
    pikatyuandzekuromuGX:'../img/patterns/調整.png',
    megasanaitoEX:'../img/patterns/上昇ストップ.png',
    nidorannosu:'../img/patterns/調整.png',
    meresi:'../img/patterns/上昇.png',
    pattiragon:'../img/patterns/下降.png',
    hayasigame:'../img/patterns/急落.png',
    meganiumu:'../img/patterns/リバウンド.png',
    ruamojuru:'../img/patterns/上昇ストップ.png',
    appuryuVMAX:'../img/patterns/急落.png',
    raiti:'../img/patterns/上昇ストップ.png',
    supaikutaun:'../img/patterns/急上昇.png',
    sattimusi:'../img/patterns/急落.png',
    tatakko:'../img/patterns/下降.png',
    efi:'../img/patterns/急落.png',
    haganeruV:'../img/patterns/下げ止まり.png',
    mantannnokusuri:'../img/patterns/下降.png',
    matadogasu:'../img/patterns/上昇.png',
    yunittoenerugi:'../img/patterns/急落.png',
    akeosu:'../img/patterns/下降.png',
    kyuremu:'../img/patterns/下げ止まり.png',
    fione:'../img/patterns/下降.png',
    torunerosu:'../img/patterns/上昇ストップ.png',
    girathina:'../img/patterns/上昇ストップ.png',
    serebi_ameizingurea:'../img/patterns/上昇ストップ.png',
    pijon:'../img/patterns/リバウンド.png',
    marein:'../img/patterns/リバウンド.png',
    supaboru:'../img/patterns/下げ止まり.png',
    raityuGX:'../img/patterns/もみ合い.png',
    zizironGX:'../img/patterns/上昇ストップ.png',
    purutoga:'../img/patterns/上昇.png',
    hupaV:'../img/patterns/上昇.png',
    aroragaragara:'../img/patterns/もみ合い.png',
    nyura:'../img/patterns/調整.png',
    kekenkani:'../img/patterns/下降.png',
    shakuya:'../img/patterns/下げ止まり.png',
    kuitukusaretagenya:'../img/patterns/急落.png',
    masakinokaiseki:'../img/patterns/急上昇.png',
    soratobupikatyuV:'../img/patterns/下げ止まり.png',
    kurosusuittya:'../img/patterns/急落.png',
    datenguGX:'../img/patterns/下げ止まり.png',
    yadon:'../img/patterns/急落.png',
    kyanpusetto:'../img/patterns/もみ合い.png',
    nyasu:'../img/patterns/上昇ストップ.png',
    uturoido:'../img/patterns/リバウンド.png',
    husigibanaV:'../img/patterns/急落.png',
    ayasikandume:'../img/patterns/急落.png',
    gureggurumira:'../img/patterns/上昇.png',
    hikarumyu:'../img/patterns/上昇.png',
    toikyattya:'../img/patterns/急上昇.png',
    yukikaburimira:'../img/patterns/もみ合い.png',
    kimori:'../img/patterns/もみ合い.png',
    pureshasuboru:'../img/patterns/下げ止まり.png',
    dorapion:'../img/patterns/急上昇.png',
    aserora:'../img/patterns/急落.png',
    jazziman:'../img/patterns/下降.png',
    bariyadomira:'../img/patterns/リバウンド.png'
  },
   d180:{
    feary:'../img/patterns/下降.png',
    woro:'../img/patterns/下げ止まり.png',
    perusianGX:'../img/patterns/上昇ストップ.png',
    dadarin:'../img/patterns/急落.png',
    karuisi:'../img/patterns/リバウンド.png',
    faiya:'../img/patterns/調整.png',
    messon:'../img/patterns/急落.png',
    uotirudonV:'../img/patterns/もみ合い.png',
    aroranassiV:'../img/patterns/急落.png',
    hisuibakuhun:'../img/patterns/上昇.png',
    fezaboru:'../img/patterns/急上昇.png',
    katuranoippatushoubu:'../img/patterns/上昇.png',
    suikunV:'../img/patterns/リバウンド.png',
    susukimira:'../img/patterns/上昇.png',
    merumetaruGX:'../img/patterns/下げ止まり.png',
    erementarubazzi:'../img/patterns/急落.png',
    nagi:'../img/patterns/調整.png',
    obonnnomi:'../img/patterns/リバウンド.png',
    cherinbo:'../img/patterns/急落.png',
    gararusanigo:'../img/patterns/急落.png',
    kasutamukyattya:'../img/patterns/急上昇.png',
    arorasandopan:'../img/patterns/急落.png',
    hisuimarumainV:'../img/patterns/急落.png',
    hihidaruma:'../img/patterns/急落.png',
    gaogaenEX:'../img/patterns/上昇ストップ.png',
    oisiimizusetto:'../img/patterns/調整.png',
    yadoran:'../img/patterns/急上昇.png',
    akagi:'../img/patterns/急落.png',
    pokemontuusin:'../img/patterns/急落.png',
    eruhun:'../img/patterns/下げ止まり.png',
    bariyado:'../img/patterns/もみ合い.png',
    jazzimanhoissuru:'../img/patterns/急上昇.png',
    sirodesuna:'../img/patterns/上昇ストップ.png',
    magumadannnoguradon:'../img/patterns/上昇.png',
    neoranto:'../img/patterns/上昇.png',
    pijotto:'../img/patterns/上昇ストップ.png',
    gekkougaandzoroakuGX:'../img/patterns/急上昇.png',
    rokettodannnomimikkyuGX:'../img/patterns/下げ止まり.png',
    makisi:'../img/patterns/急落.png',
    baibanira:'../img/patterns/急落.png',
    orizinparukiaVSTAR:'../img/patterns/上昇.png',
    utugihakasenorekutya:'../img/patterns/急落.png',
    hurizaGX:'../img/patterns/急上昇.png',
    kosokumusi:'../img/patterns/急落.png',
    pikatyuandzekuromuGX:'../img/patterns/リバウンド.png',
    megasanaitoEX:'../img/patterns/上昇ストップ.png',
    nidorannosu:'../img/patterns/上昇ストップ.png',
    meresi:'../img/patterns/上昇ストップ.png',
    pattiragon:'../img/patterns/急落.png',
    hayasigame:'../img/patterns/下げ止まり.png',
    meganiumu:'../img/patterns/急落.png',
    ruamojuru:'../img/patterns/急落.png',
    appuryuVMAX:'../img/patterns/急上昇.png',
    raiti:'../img/patterns/急上昇.png',
    supaikutaun:'../img/patterns/急上昇.png',
    sattimusi:'../img/patterns/下降.png',
    tatakko:'../img/patterns/急落.png',
    efi:'../img/patterns/急上昇.png',
    haganeruV:'../img/patterns/上昇.png',
    mantannnokusuri:'../img/patterns/急落.png',
    matadogasu:'../img/patterns/上昇ストップ.png',
    yunittoenerugi:'../img/patterns/下げ止まり.png',
    akeosu:'../img/patterns/リバウンド.png',
    kyuremu:'../img/patterns/急落.png',
    fione:'../img/patterns/調整.png',
    torunerosu:'../img/patterns/急上昇.png',
    girathina:'../img/patterns/急上昇.png',
    serebi_ameizingurea:'../img/patterns/上昇ストップ.png',
    pijon:'../img/patterns/下降.png',
    marein:'../img/patterns/調整.png',
    supaboru:'../img/patterns/急落.png',
    raityuGX:'../img/patterns/もみ合い.png',
    zizironGX:'../img/patterns/リバウンド.png',
    purutoga:'../img/patterns/急上昇.png',
    hupaV:'../img/patterns/急上昇.png',
    aroragaragara:'../img/patterns/上昇ストップ.png',
    nyura:'../img/patterns/急上昇.png',
    kekenkani:'../img/patterns/調整.png',
    shakuya:'../img/patterns/上昇.png',
    kuitukusaretagenya:'../img/patterns/急上昇.png',
    masakinokaiseki:'../img/patterns/急上昇.png',
    soratobupikatyuV:'../img/patterns/下げ止まり.png',
    kurosusuittya:'../img/patterns/急上昇.png',
    datenguGX:'../img/patterns/上昇ストップ.png',
    yadon:'../img/patterns/急落.png',
    kyanpusetto:'../img/patterns/リバウンド.png',
    nyasu:'../img/patterns/急上昇.png',
    uturoido:'../img/patterns/リバウンド.png',
    husigibanaV:'../img/patterns/リバウンド.png',
    ayasikandume:'../img/patterns/急上昇.png',
    gureggurumira:'../img/patterns/リバウンド.png',
    hikarumyu:'../img/patterns/急落.png',
    toikyattya:'../img/patterns/上昇ストップ.png',
    yukikaburimira:'../img/patterns/下げ止まり.png',
    kimori:'../img/patterns/もみ合い.png',
    pureshasuboru:'../img/patterns/急落.png',
    dorapion:'../img/patterns/上昇.png',
    aserora:'../img/patterns/調整.png',
    jazziman:'../img/patterns/上昇.png',
    bariyadomira:'../img/patterns/下げ止まり.png'
  },
   d365:{
    feary:'../img/patterns/調整.png',
    woro:'../img/patterns/下降.png',
    perusianGX:'../img/patterns/上昇ストップ.png',
    dadarin:'../img/patterns/上昇ストップ.png',
    karuisi:'../img/patterns/下げ止まり.png',
    faiya:'../img/patterns/下げ止まり.png',
    messon:'../img/patterns/下げ止まり.png',
    uotirudonV:'../img/patterns/急落.png',
    aroranassiV:'../img/patterns/下げ止まり.png',
    hisuibakuhun:'../img/patterns/急上昇.png',
    fezaboru:'../img/patterns/上昇ストップ.png',
    katuranoippatushoubu:'../img/patterns/上昇ストップ.png',
    suikunV:'../img/patterns/下降.png',
    susukimira:'../img/patterns/上昇ストップ.png',
    merumetaruGX:'../img/patterns/下降.png',
    erementarubazzi:'../img/patterns/上昇ストップ.png',
    nagi:'../img/patterns/急上昇.png',
    obonnnomi:'../img/patterns/上昇ストップ.png',
    cherinbo:'../img/patterns/急落.png',
    gararusanigo:'../img/patterns/上昇.png',
    kasutamukyattya:'../img/patterns/上昇ストップ.png',
    arorasandopan:'../img/patterns/上昇ストップ.png',
    hisuimarumainV:'../img/patterns/下げ止まり.png',
    hihidaruma:'../img/patterns/上昇ストップ.png',
    gaogaenEX:'../img/patterns/上昇ストップ.png',
    oisiimizusetto:'../img/patterns/下げ止まり.png',
    yadoran:'../img/patterns/急上昇.png',
    akagi:'../img/patterns/上昇.png',
    pokemontuusin:'../img/patterns/急落.png',
    eruhun:'../img/patterns/急落.png',
    bariyado:'../img/patterns/上昇ストップ.png',
    jazzimanhoissuru:'../img/patterns/上昇ストップ.png',
    sirodesuna:'../img/patterns/急上昇.png',
    magumadannnoguradon:'../img/patterns/上昇.png',
    neoranto:'../img/patterns/急上昇.png',
    pijotto:'../img/patterns/急上昇.png',
    gekkougaandzoroakuGX:'../img/patterns/下降.png',
    rokettodannnomimikkyuGX:'../img/patterns/急落.png',
    makisi:'../img/patterns/上昇ストップ.png',
    baibanira:'../img/patterns/調整.png',
    orizinparukiaVSTAR:'../img/patterns/急上昇.png',
    utugihakasenorekutya:'../img/patterns/上昇ストップ.png',
    hurizaGX:'../img/patterns/下げ止まり.png',
    kosokumusi:'../img/patterns/上昇ストップ.png',
    pikatyuandzekuromuGX:'../img/patterns/上昇ストップ.png',
    megasanaitoEX:'../img/patterns/上昇ストップ.png',
    nidorannosu:'../img/patterns/上昇.png',
    meresi:'../img/patterns/上昇ストップ.png',
    pattiragon:'../img/patterns/調整.png',
    hayasigame:'../img/patterns/調整.png',
    meganiumu:'../img/patterns/調整.png',
    ruamojuru:'../img/patterns/リバウンド.png',
    appuryuVMAX:'../img/patterns/急上昇.png',
    raiti:'../img/patterns/急上昇.png',
    supaikutaun:'../img/patterns/急上昇.png',
    sattimusi:'../img/patterns/下降.png',
    tatakko:'../img/patterns/下げ止まり.png',
    efi:'../img/patterns/急上昇.png',
    haganeruV:'../img/patterns/リバウンド.png',
    mantannnokusuri:'../img/patterns/調整.png',
    matadogasu:'../img/patterns/急上昇.png',
    yunittoenerugi:'../img/patterns/調整.png',
    akeosu:'../img/patterns/調整.png',
    kyuremu:'../img/patterns/調整.png',
    fione:'../img/patterns/急上昇.png',
    torunerosu:'../img/patterns/上昇.png',
    girathina:'../img/patterns/急上昇.png',
    serebi_ameizingurea:'../img/patterns/上昇ストップ.png',
    pijon:'../img/patterns/上昇ストップ.png',
    marein:'../img/patterns/上昇.png',
    supaboru:'../img/patterns/調整.png',
    raityuGX:'../img/patterns/下降.png',
    zizironGX:'../img/patterns/急落.png',
    purutoga:'../img/patterns/急上昇.png',
    hupaV:'../img/patterns/急上昇.png',
    aroragaragara:'../img/patterns/上昇.png',
    nyura:'../img/patterns/上昇.png',
    kekenkani:'../img/patterns/上昇ストップ.png',
    shakuya:'../img/patterns/急上昇.png',
    kuitukusaretagenya:'../img/patterns/急上昇.png',
    masakinokaiseki:'../img/patterns/上昇ストップ.png',
    soratobupikatyuV:'../img/patterns/調整.png',
    kurosusuittya:'../img/patterns/下降.png',
    datenguGX:'../img/patterns/上昇.png',
    yadon:'../img/patterns/下降.png',
    kyanpusetto:'../img/patterns/上昇ストップ.png',
    nyasu:'../img/patterns/急上昇.png',
    uturoido:'../img/patterns/上昇ストップ.png',
    husigibanaV:'../img/patterns/調整.png',
    ayasikandume:'../img/patterns/リバウンド.png',
    gureggurumira:'../img/patterns/調整.png',
    hikarumyu:'../img/patterns/上昇ストップ.png',
    toikyattya:'../img/patterns/急上昇.png',
    yukikaburimira:'../img/patterns/調整.png',
    kimori:'../img/patterns/上昇ストップ.png',
    pureshasuboru:'../img/patterns/下げ止まり.png',
    dorapion:'../img/patterns/上昇.png',
    aserora:'../img/patterns/下げ止まり.png',
    jazziman:'../img/patterns/上昇.png',
    bariyadomira:'../img/patterns/調整.png'
   }
  };
  var arrows = {
   d30:{
    feary:'../img/arrows/変動なし.png',
    woro:'../img/arrows/変動なし.png',
    perusianGX:'../img/arrows/変動なし.png',
    dadarin:'../img/arrows/変動なし.png',
    karuisi:'../img/arrows/変動なし.png',
    faiya:'../img/arrows/変動なし.png',
    messon:'../img/arrows/下降.png',
    uotirudonV:'../img/arrows/変動なし.png',
    aroranassiV:'../img/arrows/変動なし.png',
    hisuibakuhun:'../img/arrows/変動なし.png',
    fezaboru:'../img/arrows/変動なし.png',
    katuranoippatushoubu:'../img/arrows/変動なし.png',
    suikunV:'../img/arrows/変動なし.png',
    susukimira:'../img/arrows/変動なし.png',
    merumetaruGX:'../img/arrows/上昇.png',
    erementarubazzi:'../img/arrows/変動なし.png',
    nagi:'../img/arrows/変動なし.png',
    obonnnomi:'../img/arrows/変動なし.png',
    cherinbo:'../img/arrows/下降.png',
    gararusanigo:'../img/arrows/変動なし.png',
    kasutamukyattya:'../img/arrows/変動なし.png',
    arorasandopan:'../img/arrows/変動なし.png',
    hisuimarumainV:'../img/arrows/上昇.png',
    hihidaruma:'../img/arrows/変動なし.png',
    gaogaenEX:'../img/arrows/変動なし.png',
    oisiimizusetto:'../img/arrows/変動なし.png',
    yadoran:'../img/arrows/変動なし.png',
    akagi:'../img/arrows/変動なし.png',
    pokemontuusin:'../img/arrows/変動なし.png',
    eruhun:'../img/arrows/変動なし.png',
    bariyado:'../img/arrows/変動なし.png',
    jazzimanhoissuru:'../img/arrows/変動なし.png',
    sirodesuna:'../img/arrows/変動なし.png',
    magumadannnoguradon:'../img/arrows/変動なし.png',
    neoranto:'../img/arrows/変動なし.png',
    pijotto:'../img/arrows/変動なし.png',
    gekkougaandzoroakuGX:'../img/arrows/下降.png',
    rokettodannnomimikkyuGX:'../img/arrows/変動なし.png',
    makisi:'../img/arrows/上昇.png',
    baibanira:'../img/arrows/変動なし.png',
    orizinparukiaVSTAR:'../img/arrows/変動なし.png',
    utugihakasenorekutya:'../img/arrows/変動なし.png',
    hurizaGX:'../img/arrows/変動なし.png',
    kosokumusi:'../img/arrows/変動なし.png',
    pikatyuandzekuromuGX:'../img/arrows/変動なし.png',
    megasanaitoEX:'../img/arrows/変動なし.png',
    nidorannosu:'../img/arrows/変動なし.png',
    meresi:'../img/arrows/変動なし.png',
    pattiragon:'../img/arrows/変動なし.png',
    hayasigame:'../img/arrows/変動なし.png',
    meganiumu:'../img/arrows/上昇.png',
    ruamojuru:'../img/arrows/変動なし.png',
    appuryuVMAX:'../img/arrows/変動なし.png',
    raiti:'../img/arrows/上昇.png',
    supaikutaun:'../img/arrows/変動なし.png',
    sattimusi:'../img/arrows/変動なし.png',
    tatakko:'../img/arrows/変動なし.png',
    efi:'../img/arrows/変動なし.png',
    haganeruV:'../img/arrows/上昇.png',
    mantannnokusuri:'../img/arrows/変動なし.png',
    matadogasu:'../img/arrows/上昇.png',
    yunittoenerugi:'../img/arrows/下降.png',
    akeosu:'../img/arrows/変動なし.png',
    kyuremu:'../img/arrows/変動なし.png',
    fione:'../img/arrows/変動なし.png',
    torunerosu:'../img/arrows/変動なし.png',
    girathina:'../img/arrows/下降.png',
    serebi_ameizingurea:'../img/arrows/変動なし.png',
    pijon:'../img/arrows/変動なし.png',
    marein:'../img/arrows/上昇.png',
    supaboru:'../img/arrows/変動なし.png',
    raityuGX:'../img/arrows/変動なし.png',
    zizironGX:'../img/arrows/下降.png',
    purutoga:'../img/arrows/変動なし.png',
    hupaV:'../img/arrows/変動なし.png',
    aroragaragara:'../img/arrows/変動なし.png',
    nyura:'../img/arrows/変動なし.png',
    kekenkani:'../img/arrows/変動なし.png',
    shakuya:'../img/arrows/下降.png',
    kuitukusaretagenya:'../img/arrows/変動なし.png',
    masakinokaiseki:'../img/arrows/変動なし.png',
    soratobupikatyuV:'../img/arrows/変動なし.png',
    kurosusuittya:'../img/arrows/変動なし.png',
    datenguGX:'../img/arrows/上昇.png',
    yadon:'../img/arrows/変動なし.png',
    kyanpusetto:'../img/arrows/変動なし.png',
    nyasu:'../img/arrows/変動なし.png',
    uturoido:'../img/arrows/上昇.png',
    husigibanaV:'../img/arrows/下降.png',
    ayasikandume:'../img/arrows/変動なし.png',
    gureggurumira:'../img/arrows/変動なし.png',
    hikarumyu:'../img/arrows/変動なし.png',
    toikyattya:'../img/arrows/変動なし.png',
    yukikaburimira:'../img/arrows/変動なし.png',
    kimori:'../img/arrows/変動なし.png',
    pureshasuboru:'../img/arrows/変動なし.png',
    dorapion:'../img/arrows/変動なし.png',
    aserora:'../img/arrows/変動なし.png',
    jazziman:'../img/arrows/変動なし.png',
    bariyadomira:'../img/arrows/上昇.png'
  },
   d60:{
    feary:'../img/arrows/変動なし.png',
    woro:'../img/arrows/変動なし.png',
    perusianGX:'../img/arrows/下降.png',
    dadarin:'../img/arrows/下降.png',
    karuisi:'../img/arrows/下降.png',
    faiya:'../img/arrows/下降.png',
    messon:'../img/arrows/下降.png',
    uotirudonV:'../img/arrows/変動なし.png',
    aroranassiV:'../img/arrows/変動なし.png',
    hisuibakuhun:'../img/arrows/下降.png',
    fezaboru:'../img/arrows/変動なし.png',
    katuranoippatushoubu:'../img/arrows/下降.png',
    suikunV:'../img/arrows/下降.png',
    susukimira:'../img/arrows/変動なし.png',
    merumetaruGX:'../img/arrows/変動なし.png',
    erementarubazzi:'../img/arrows/下降.png',
    nagi:'../img/arrows/変動なし.png',
    obonnnomi:'../img/arrows/上昇.png',
    cherinbo:'../img/arrows/下降.png',
    gararusanigo:'../img/arrows/上昇.png',
    kasutamukyattya:'../img/arrows/上昇.png',
    arorasandopan:'../img/arrows/下降.png',
    hisuimarumainV:'../img/arrows/上昇.png',
    hihidaruma:'../img/arrows/下降.png',
    gaogaenEX:'../img/arrows/変動なし.png',
    oisiimizusetto:'../img/arrows/変動なし.png',
    yadoran:'../img/arrows/下降.png',
    akagi:'../img/arrows/下降.png',
    pokemontuusin:'../img/arrows/下降.png',
    eruhun:'../img/arrows/下降.png',
    bariyado:'../img/arrows/変動なし.png',
    jazzimanhoissuru:'../img/arrows/下降.png',
    sirodesuna:'../img/arrows/下降.png',
    magumadannnoguradon:'../img/arrows/下降.png',
    neoranto:'../img/arrows/上昇.png',
    pijotto:'../img/arrows/上昇.png',
    gekkougaandzoroakuGX:'../img/arrows/下降.png',
    rokettodannnomimikkyuGX:'../img/arrows/変動なし.png',
    makisi:'../img/arrows/上昇.png',
    baibanira:'../img/arrows/変動なし.png',
    orizinparukiaVSTAR:'../img/arrows/下降.png',
    utugihakasenorekutya:'../img/arrows/変動なし.png',
    hurizaGX:'../img/arrows/下降.png',
    kosokumusi:'../img/arrows/下降.png',
    pikatyuandzekuromuGX:'../img/arrows/下降.png',
    megasanaitoEX:'../img/arrows/変動なし.png',
    nidorannosu:'../img/arrows/下降.png',
    meresi:'../img/arrows/上昇.png',
    pattiragon:'../img/arrows/下降.png',
    hayasigame:'../img/arrows/下降.png',
    meganiumu:'../img/arrows/上昇.png',
    ruamojuru:'../img/arrows/変動なし.png',
    appuryuVMAX:'../img/arrows/下降.png',
    raiti:'../img/arrows/変動なし.png',
    supaikutaun:'../img/arrows/上昇.png',
    sattimusi:'../img/arrows/下降.png',
    tatakko:'../img/arrows/下降.png',
    efi:'../img/arrows/下降.png',
    haganeruV:'../img/arrows/変動なし.png',
    mantannnokusuri:'../img/arrows/下降.png',
    matadogasu:'../img/arrows/上昇.png',
    yunittoenerugi:'../img/arrows/下降.png',
    akeosu:'../img/arrows/下降.png',
    kyuremu:'../img/arrows/変動なし.png',
    fione:'../img/arrows/下降.png',
    torunerosu:'../img/arrows/変動なし.png',
    girathina:'../img/arrows/変動なし.png',
    serebi_ameizingurea:'../img/arrows/変動なし.png',
    pijon:'../img/arrows/上昇.png',
    marein:'../img/arrows/上昇.png',
    supaboru:'../img/arrows/変動なし.png',
    raityuGX:'../img/arrows/変動なし.png',
    zizironGX:'../img/arrows/変動なし.png',
    purutoga:'../img/arrows/上昇.png',
    hupaV:'../img/arrows/上昇.png',
    aroragaragara:'../img/arrows/変動なし.png',
    nyura:'../img/arrows/下降.png',
    kekenkani:'../img/arrows/下降.png',
    shakuya:'../img/arrows/変動なし.png',
    kuitukusaretagenya:'../img/arrows/下降.png',
    masakinokaiseki:'../img/arrows/上昇.png',
    soratobupikatyuV:'../img/arrows/変動なし.png',
    kurosusuittya:'../img/arrows/下降.png',
    datenguGX:'../img/arrows/変動なし.png',
    yadon:'../img/arrows/下降.png',
    kyanpusetto:'../img/arrows/変動なし.png',
    nyasu:'../img/arrows/変動なし.png',
    uturoido:'../img/arrows/上昇.png',
    husigibanaV:'../img/arrows/下降.png',
    ayasikandume:'../img/arrows/下降.png',
    gureggurumira:'../img/arrows/上昇.png',
    hikarumyu:'../img/arrows/上昇.png',
    toikyattya:'../img/arrows/上昇.png',
    yukikaburimira:'../img/arrows/変動なし.png',
    kimori:'../img/arrows/変動なし.png',
    pureshasuboru:'../img/arrows/変動なし.png',
    dorapion:'../img/arrows/上昇.png',
    aserora:'../img/arrows/下降.png',
    jazziman:'../img/arrows/下降.png',
    bariyadomira:'../img/arrows/上昇.png'
  },
   d180:{
    feary:'../img/arrows/下降.png',
    woro:'../img/arrows/変動なし.png',
    perusianGX:'../img/arrows/変動なし.png',
    dadarin:'../img/arrows/下降.png',
    karuisi:'../img/arrows/上昇.png',
    faiya:'../img/arrows/下降.png',
    messon:'../img/arrows/下降.png',
    uotirudonV:'../img/arrows/変動なし.png',
    aroranassiV:'../img/arrows/下降.png',
    hisuibakuhun:'../img/arrows/上昇.png',
    fezaboru:'../img/arrows/上昇.png',
    katuranoippatushoubu:'../img/arrows/上昇.png',
    suikunV:'../img/arrows/上昇.png',
    susukimira:'../img/arrows/上昇.png',
    merumetaruGX:'../img/arrows/変動なし.png',
    erementarubazzi:'../img/arrows/下降.png',
    nagi:'../img/arrows/下降.png',
    obonnnomi:'../img/arrows/上昇.png',
    cherinbo:'../img/arrows/下降.png',
    gararusanigo:'../img/arrows/下降.png',
    kasutamukyattya:'../img/arrows/上昇.png',
    arorasandopan:'../img/arrows/下降.png',
    hisuimarumainV:'../img/arrows/下降.png',
    hihidaruma:'../img/arrows/下降.png',
    gaogaenEX:'../img/arrows/変動なし.png',
    oisiimizusetto:'../img/arrows/下降.png',
    yadoran:'../img/arrows/上昇.png',
    akagi:'../img/arrows/下降.png',
    pokemontuusin:'../img/arrows/下降.png',
    eruhun:'../img/arrows/変動なし.png',
    bariyado:'../img/arrows/変動なし.png',
    jazzimanhoissuru:'../img/arrows/上昇.png',
    sirodesuna:'../img/arrows/変動なし.png',
    magumadannnoguradon:'../img/arrows/上昇.png',
    neoranto:'../img/arrows/上昇.png',
    pijotto:'../img/arrows/変動なし.png',
    gekkougaandzoroakuGX:'../img/arrows/上昇.png',
    rokettodannnomimikkyuGX:'../img/arrows/変動なし.png',
    makisi:'../img/arrows/下降.png',
    baibanira:'../img/arrows/下降.png',
    orizinparukiaVSTAR:'../img/arrows/上昇.png',
    utugihakasenorekutya:'../img/arrows/下降.png',
    hurizaGX:'../img/arrows/上昇.png',
    kosokumusi:'../img/arrows/下降.png',
    pikatyuandzekuromuGX:'../img/arrows/上昇.png',
    megasanaitoEX:'../img/arrows/変動なし.png',
    nidorannosu:'../img/arrows/変動なし.png',
    meresi:'../img/arrows/変動なし.png',
    pattiragon:'../img/arrows/下降.png',
    hayasigame:'../img/arrows/変動なし.png',
    meganiumu:'../img/arrows/下降.png',
    ruamojuru:'../img/arrows/下降.png',
    appuryuVMAX:'../img/arrows/上昇.png',
    raiti:'../img/arrows/上昇.png',
    supaikutaun:'../img/arrows/上昇.png',
    sattimusi:'../img/arrows/下降.png',
    tatakko:'../img/arrows/下降.png',
    efi:'../img/arrows/上昇.png',
    haganeruV:'../img/arrows/上昇.png',
    mantannnokusuri:'../img/arrows/下降.png',
    matadogasu:'../img/arrows/変動なし.png',
    yunittoenerugi:'../img/arrows/変動なし.png',
    akeosu:'../img/arrows/上昇.png',
    kyuremu:'../img/arrows/下降.png',
    fione:'../img/arrows/下降.png',
    torunerosu:'../img/arrows/上昇.png',
    girathina:'../img/arrows/上昇.png',
    serebi_ameizingurea:'../img/arrows/変動なし.png',
    pijon:'../img/arrows/下降.png',
    marein:'../img/arrows/下降.png',
    supaboru:'../img/arrows/下降.png',
    raityuGX:'../img/arrows/変動なし.png',
    zizironGX:'../img/arrows/上昇.png',
    purutoga:'../img/arrows/上昇.png',
    hupaV:'../img/arrows/上昇.png',
    aroragaragara:'../img/arrows/変動なし.png',
    nyura:'../img/arrows/上昇.png',
    kekenkani:'../img/arrows/下降.png',
    shakuya:'../img/arrows/上昇.png',
    kuitukusaretagenya:'../img/arrows/上昇.png',
    masakinokaiseki:'../img/arrows/上昇.png',
    soratobupikatyuV:'../img/arrows/変動なし.png',
    kurosusuittya:'../img/arrows/上昇.png',
    datenguGX:'../img/arrows/変動なし.png',
    yadon:'../img/arrows/下降.png',
    kyanpusetto:'../img/arrows/上昇.png',
    nyasu:'../img/arrows/上昇.png',
    uturoido:'../img/arrows/上昇.png',
    husigibanaV:'../img/arrows/上昇.png',
    ayasikandume:'../img/arrows/上昇.png',
    gureggurumira:'../img/arrows/上昇.png',
    hikarumyu:'../img/arrows/下降.png',
    toikyattya:'../img/arrows/変動なし.png',
    yukikaburimira:'../img/arrows/変動なし.png',
    kimori:'../img/arrows/変動なし.png',
    pureshasuboru:'../img/arrows/下降.png',
    dorapion:'../img/arrows/上昇.png',
    aserora:'../img/arrows/下降.png',
    jazziman:'../img/arrows/上昇.png',
    bariyadomira:'../img/arrows/変動なし.png'
  },
   d365:{
    feary:'../img/arrows/下降.png',
    woro:'../img/arrows/下降.png',
    perusianGX:'../img/arrows/変動なし.png',
    dadarin:'../img/arrows/変動なし.png',
    karuisi:'../img/arrows/変動なし.png',
    faiya:'../img/arrows/変動なし.png',
    messon:'../img/arrows/変動なし.png',
    uotirudonV:'../img/arrows/下降.png',
    aroranassiV:'../img/arrows/変動なし.png',
    hisuibakuhun:'../img/arrows/上昇.png',
    fezaboru:'../img/arrows/変動なし.png',
    katuranoippatushoubu:'../img/arrows/変動なし.png',
    suikunV:'../img/arrows/下降.png',
    susukimira:'../img/arrows/変動なし.png',
    merumetaruGX:'../img/arrows/下降.png',
    erementarubazzi:'../img/arrows/変動なし.png',
    nagi:'../img/arrows/上昇.png',
    obonnnomi:'../img/arrows/変動なし.png',
    cherinbo:'../img/arrows/下降.png',
    gararusanigo:'../img/arrows/上昇.png',
    kasutamukyattya:'../img/arrows/変動なし.png',
    arorasandopan:'../img/arrows/変動なし.png',
    hisuimarumainV:'../img/arrows/変動なし.png',
    hihidaruma:'../img/arrows/変動なし.png',
    gaogaenEX:'../img/arrows/変動なし.png',
    oisiimizusetto:'../img/arrows/変動なし.png',
    yadoran:'../img/arrows/上昇.png',
    akagi:'../img/arrows/上昇.png',
    pokemontuusin:'../img/arrows/下降.png',
    eruhun:'../img/arrows/下降.png',
    bariyado:'../img/arrows/変動なし.png',
    jazzimanhoissuru:'../img/arrows/変動なし.png',
    sirodesuna:'../img/arrows/上昇.png',
    magumadannnoguradon:'../img/arrows/上昇.png',
    neoranto:'../img/arrows/上昇.png',
    pijotto:'../img/arrows/上昇.png',
    gekkougaandzoroakuGX:'../img/arrows/下降.png',
    rokettodannnomimikkyuGX:'../img/arrows/下降.png',
    makisi:'../img/arrows/変動なし.png',
    baibanira:'../img/arrows/下降.png',
    orizinparukiaVSTAR:'../img/arrows/上昇.png',
    utugihakasenorekutya:'../img/arrows/変動なし.png',
    hurizaGX:'../img/arrows/変動なし.png',
    kosokumusi:'../img/arrows/変動なし.png',
    pikatyuandzekuromuGX:'../img/arrows/変動なし.png',
    megasanaitoEX:'../img/arrows/変動なし.png',
    nidorannosu:'../img/arrows/上昇.png',
    meresi:'../img/arrows/変動なし.png',
    pattiragon:'../img/arrows/下降.png',
    hayasigame:'../img/arrows/下降.png',
    meganiumu:'../img/arrows/下降.png',
    ruamojuru:'../img/arrows/上昇.png',
    appuryuVMAX:'../img/arrows/上昇.png',
    raiti:'../img/arrows/上昇.png',
    supaikutaun:'../img/arrows/上昇.png',
    sattimusi:'../img/arrows/下降.png',
    tatakko:'../img/arrows/変動なし.png',
    efi:'../img/arrows/上昇.png',
    haganeruV:'../img/arrows/上昇.png',
    mantannnokusuri:'../img/arrows/下降.png',
    matadogasu:'../img/arrows/上昇.png',
    yunittoenerugi:'../img/arrows/下降.png',
    akeosu:'../img/arrows/下降.png',
    kyuremu:'../img/arrows/下降.png',
    fione:'../img/arrows/上昇.png',
    torunerosu:'../img/arrows/上昇.png',
    girathina:'../img/arrows/上昇.png',
    serebi_ameizingurea:'../img/arrows/変動なし.png',
    pijon:'../img/arrows/変動なし.png',
    marein:'../img/arrows/上昇.png',
    supaboru:'../img/arrows/下降.png',
    raityuGX:'../img/arrows/下降.png',
    zizironGX:'../img/arrows/下降.png',
    purutoga:'../img/arrows/上昇.png',
    hupaV:'../img/arrows/上昇.png',
    aroragaragara:'../img/arrows/上昇.png',
    nyura:'../img/arrows/上昇.png',
    kekenkani:'../img/arrows/変動なし.png',
    shakuya:'../img/arrows/上昇.png',
    kuitukusaretagenya:'../img/arrows/上昇.png',
    masakinokaiseki:'../img/arrows/変動なし.png',
    soratobupikatyuV:'../img/arrows/下降.png',
    kurosusuittya:'../img/arrows/下降.png',
    datenguGX:'../img/arrows/上昇.png',
    yadon:'../img/arrows/下降.png',
    kyanpusetto:'../img/arrows/変動なし.png',
    nyasu:'../img/arrows/上昇.png',
    uturoido:'../img/arrows/変動なし.png',
    husigibanaV:'../img/arrows/下降.png',
    ayasikandume:'../img/arrows/上昇.png',
    gureggurumira:'../img/arrows/下降.png',
    hikarumyu:'../img/arrows/変動なし.png',
    toikyattya:'../img/arrows/上昇.png',
    yukikaburimira:'../img/arrows/下降.png',
    kimori:'../img/arrows/変動なし.png',
    pureshasuboru:'../img/arrows/変動なし.png',
    dorapion:'../img/arrows/上昇.png',
    aserora:'../img/arrows/変動なし.png',
    jazziman:'../img/arrows/上昇.png',
    bariyadomira:'../img/arrows/下降.png'
   }
  };


  // 画像のソースを更新
  //チャート
  if (type && charts.d30 && charts.d30[type]) {
    document.querySelector(`#Box1 .chart img`).src = charts.d30[type];
  }if (type && charts.d60 && charts.d60[type]) {
    document.querySelector(`#Box2 .chart img`).src = charts.d60[type];
  }if (type && charts.d180 && charts.d180[type]) {
    document.querySelector(`#Box3 .chart img`).src = charts.d180[type];
  }if (type && charts.d365 && charts.d365[type]) {
    document.querySelector(`#Box4 .chart img`).src = charts.d365[type];
  }
  //パターン
  if (type && patterns.d30 && patterns.d30[type]) {
    document.querySelector(`#Box1 .pattern img`).src = patterns.d30[type];
  }if (type && patterns.d60 && patterns.d60[type]) {
    document.querySelector(`#Box2 .pattern img`).src = patterns.d60[type];
  }if (type && patterns.d180 && patterns.d180[type]) {
    document.querySelector(`#Box3 .pattern img`).src = patterns.d180[type];
  }if (type && patterns.d365 && patterns.d365[type]) {
    document.querySelector(`#Box4 .pattern img`).src = patterns.d365[type];
  }
  //今後の変動
  if (type && arrows.d30 && arrows.d30[type]) {
    document.querySelector(`#Box1 .arrow img`).src = arrows.d30[type];
  }if (type && arrows.d60 && arrows.d60[type]) {
    document.querySelector(`#Box2 .arrow img`).src = arrows.d60[type];
  }if (type && arrows.d180 && patterns.d180[type]) {
    document.querySelector(`#Box3 .arrow img`).src = arrows.d180[type];
  }if (type && arrows.d365 && patterns.d365[type]) {
    document.querySelector(`#Box4 .arrow img`).src = arrows.d365[type];
  }
});
