const state = { lang: "zh", mode: "intro" };
function refreshDisplay() {
  document.querySelectorAll("[data-lang]").forEach(el => {
    const langOk = el.dataset.lang === state.lang;
    const modeOk = !el.dataset.mode || el.dataset.mode === state.mode;
    el.classList.toggle("hidden", !(langOk && modeOk));
  });
  document.querySelectorAll("[data-module-btn]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.langBtn === state.lang && btn.dataset.modeBtn === state.mode);
  });
  const zhReturn = document.getElementById("zhFullReturn");
  const enReturn = document.getElementById("enFullReturn");
  if (zhReturn) zhReturn.classList.toggle("hidden", !(state.lang === "zh" && state.mode === "full"));
  if (enReturn) enReturn.classList.toggle("hidden", !(state.lang === "en" && state.mode === "full"));
}
function setModule(lang, mode) {
  state.lang = lang;
  state.mode = mode;
  refreshDisplay();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
window.addEventListener("DOMContentLoaded", () => refreshDisplay());

/* V0.6H FORMAL - Large Text Reading */
function refreshLargeTextButton(){
  const btn = document.getElementById("largeTextBtn");
  if (!btn) return;
  const enabled = document.body.classList.contains("large-text");
  btn.innerHTML = enabled
    ? '<span class="main">正常字體</span><span class="sub">Normal</span>'
    : '<span class="main">大字閱讀</span><span class="sub">Large Text</span>';
}
function toggleLargeText(){
  document.body.classList.toggle("large-text");
  localStorage.setItem("largeTextEnabled", document.body.classList.contains("large-text") ? "1" : "0");
  refreshLargeTextButton();
}
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("largeTextEnabled") === "1") {
    document.body.classList.add("large-text");
  }
  refreshLargeTextButton();
});


/* V0.9A SAFE - Traditional/Simplified Chinese Toggle
   Safe rule: only text nodes inside Chinese article text sections are converted.
   It never rewrites the whole HTML, never touches UI structure, CSS, or links.
*/
const tcScState = { simplified: false };
const tcOriginalText = new WeakMap();

const tcToScMap = {
  "萬":"万","與":"与","專":"专","業":"业","東":"东","絲":"丝","丟":"丢","兩":"两","嚴":"严","喪":"丧","個":"个","豐":"丰",
  "臨":"临","為":"为","麗":"丽","舉":"举","義":"义","烏":"乌","樂":"乐","喬":"乔","習":"习","鄉":"乡","書":"书","買":"买",
  "亂":"乱","乾":"干","了":"了","爭":"争","於":"于","虧":"亏","雲":"云","亞":"亚","產":"产","親":"亲","褻":"亵","億":"亿",
  "僅":"仅","僕":"仆","從":"从","倉":"仓","儀":"仪","價":"价","眾":"众","優":"优","會":"会","傘":"伞","偉":"伟","傳":"传",
  "傷":"伤","傾":"倾","僑":"侨","僕":"仆","僥":"侥","償":"偿","兒":"儿","兇":"凶","內":"内","兩":"两","冊":"册","寫":"写",
  "軍":"军","農":"农","冠":"冠","冤":"冤","凍":"冻","劃":"划","創":"创","劉":"刘","剛":"刚","別":"别","刪":"删","劇":"剧",
  "劍":"剑","劑":"剂","辦":"办","務":"务","動":"动","勁":"劲","勢":"势","勞":"劳","勝":"胜","區":"区","醫":"医","華":"华",
  "協":"协","單":"单","賣":"卖","卻":"却","廠":"厂","歷":"历","厲":"厉","壓":"压","參":"参","雙":"双","發":"发","變":"变",
  "敘":"叙","臺":"台","台":"台","葉":"叶","號":"号","嘆":"叹","嚇":"吓","聽":"听","啟":"启","吳":"吴","員":"员","問":"问",
  "啞":"哑","喚":"唤","喪":"丧","喫":"吃","嚮":"向","嚴":"严","囉":"啰","國":"国","圍":"围","園":"园","圓":"圆","圖":"图",
  "團":"团","聖":"圣","場":"场","壞":"坏","塊":"块","堅":"坚","壇":"坛","壓":"压","壘":"垒","壯":"壮","壽":"寿","夢":"梦",
  "夠":"够","頭":"头","夾":"夹","奪":"夺","奮":"奋","奶":"奶","婦":"妇","姍":"姗","娛":"娱","孫":"孙","學":"学","寶":"宝",
  "實":"实","寧":"宁","審":"审","寫":"写","寬":"宽","寵":"宠","寶":"宝","將":"将","專":"专","尋":"寻","對":"对","導":"导",
  "屆":"届","屍":"尸","層":"层","屬":"属","歲":"岁","峽":"峡","島":"岛","嶺":"岭","嶽":"岳","巔":"巅","幣":"币","師":"师",
  "帳":"帐","帶":"带","幫":"帮","幹":"干","庫":"库","廁":"厕","廂":"厢","廣":"广","廠":"厂","廢":"废","廳":"厅","彈":"弹",
  "彎":"弯","張":"张","強":"强","彆":"别","彈":"弹","當":"当","錄":"录","彥":"彦","徑":"径","後":"后","從":"从","復":"复",
  "徵":"征","德":"德","徹":"彻","恆":"恒","惡":"恶","悅":"悦","悶":"闷","惱":"恼","慘":"惨","慣":"惯","態":"态","憐":"怜",
  "憑":"凭","應":"应","懇":"恳","懷":"怀","懸":"悬","懼":"惧","戀":"恋","戇":"戆","戰":"战","戲":"戏","戶":"户","拋":"抛",
  "挾":"挟","捨":"舍","掃":"扫","掄":"抡","掙":"挣","掛":"挂","採":"采","探":"探","揀":"拣","換":"换","揚":"扬","損":"损",
  "搖":"摇","摯":"挚","撐":"撑","撈":"捞","撥":"拨","撫":"抚","撲":"扑","撿":"捡","擁":"拥","擇":"择","擊":"击","擋":"挡",
  "據":"据","擠":"挤","擬":"拟","擺":"摆","擾":"扰","攔":"拦","攝":"摄","攜":"携","敗":"败","敘":"叙","數":"数","斂":"敛",
  "斃":"毙","斷":"断","於":"于","時":"时","晉":"晋","暈":"晕","暫":"暂","曉":"晓","曬":"晒","書":"书","會":"会","術":"术",
  "朧":"胧","東":"东","柵":"栅","標":"标","棄":"弃","棟":"栋","棧":"栈","業":"业","極":"极","樂":"乐","樓":"楼","樣":"样",
  "樹":"树","橋":"桥","機":"机","橫":"横","檔":"档","檢":"检","欄":"栏","權":"权","歡":"欢","歲":"岁","殘":"残","殼":"壳",
  "毀":"毁","氣":"气","漢":"汉","湯":"汤","溝":"沟","滅":"灭","滯":"滞","滲":"渗","滾":"滚","滿":"满","漁":"渔","漂":"漂",
  "漢":"汉","潤":"润","潛":"潜","潰":"溃","澤":"泽","濃":"浓","濕":"湿","濟":"济","濤":"涛","瀋":"沈","瀏":"浏","瀟":"潇",
  "灑":"洒","灣":"湾","為":"为","烏":"乌","無":"无","煩":"烦","煉":"炼","煙":"烟","熱":"热","燈":"灯","燒":"烧","營":"营",
  "爐":"炉","爭":"争","爺":"爷","爾":"尔","牆":"墙","獄":"狱","獨":"独","獲":"获","獸":"兽","現":"现","琺":"珐","瑪":"玛",
  "環":"环","瓊":"琼","產":"产","畢":"毕","畫":"画","異":"异","當":"当","疇":"畴","療":"疗","癡":"痴","發":"发","盜":"盗",
  "盞":"盏","監":"监","盤":"盘","盧":"卢","盡":"尽","眾":"众","睏":"困","矚":"瞩","矯":"矫","礙":"碍","禮":"礼","禍":"祸",
  "禪":"禅","離":"离","種":"种","稱":"称","穩":"稳","穎":"颖","窩":"窝","窮":"穷","竊":"窃","競":"竞","筆":"笔","筍":"笋",
  "築":"筑","範":"范","簡":"简","簽":"签","籌":"筹","籠":"笼","粵":"粤","糾":"纠","紀":"纪","約":"约","紅":"红","紋":"纹",
  "納":"纳","紐":"纽","純":"纯","紙":"纸","級":"级","紛":"纷","絕":"绝","絃":"弦","組":"组","結":"结","給":"给","絡":"络",
  "統":"统","絲":"丝","經":"经","綁":"绑","綜":"综","綠":"绿","維":"维","綱":"纲","網":"网","綵":"彩","緊":"紧","緒":"绪",
  "線":"线","緣":"缘","編":"编","緩":"缓","練":"练","縣":"县","縫":"缝","總":"总","績":"绩","織":"织","繞":"绕","繩":"绳",
  "繪":"绘","繼":"继","纏":"缠","續":"续","纖":"纤","纜":"缆","罈":"坛","罷":"罢","羅":"罗","羈":"羁","義":"义","習":"习",
  "翹":"翘","聖":"圣","聞":"闻","聯":"联","聰":"聪","聲":"声","聳":"耸","職":"职","聽":"听","肅":"肃","脅":"胁","脈":"脉",
  "脫":"脱","臉":"脸","臨":"临","與":"与","興":"兴","舉":"举","舊":"旧","艱":"艰","藝":"艺","節":"节","芻":"刍","莊":"庄",
  "萬":"万","葉":"叶","著":"着","葛":"葛","蒼":"苍","蓋":"盖","蓮":"莲","蔣":"蒋","蔥":"葱","蕭":"萧","薑":"姜","薩":"萨",
  "藍":"蓝","藏":"藏","藝":"艺","藥":"药","蘇":"苏","蘭":"兰","處":"处","虛":"虚","號":"号","蛻":"蜕","術":"术","衝":"冲",
  "衛":"卫","裝":"装","裡":"里","裏":"里","製":"制","複":"复","襲":"袭","見":"见","規":"规","親":"亲","覺":"觉","觀":"观",
  "觸":"触","訂":"订","計":"计","訊":"讯","訓":"训","託":"托","記":"记","訟":"讼","訪":"访","設":"设","許":"许","訴":"诉",
  "診":"诊","詐":"诈","詩":"诗","該":"该","詳":"详","認":"认","語":"语","誤":"误","說":"说","誰":"谁","課":"课","調":"调",
  "談":"谈","請":"请","諒":"谅","論":"论","諷":"讽","諸":"诸","諾":"诺","謀":"谋","謂":"谓","謊":"谎","謎":"谜","謝":"谢",
  "謠":"谣","謹":"谨","證":"证","識":"识","譜":"谱","警":"警","譯":"译","議":"议","護":"护","變":"变","讓":"让","豔":"艳",
  "豐":"丰","豬":"猪","貝":"贝","負":"负","財":"财","貢":"贡","貧":"贫","貨":"货","販":"贩","貪":"贪","責":"责","貴":"贵",
  "貸":"贷","費":"费","貼":"贴","貿":"贸","賀":"贺","賈":"贾","賊":"贼","資":"资","賭":"赌","賞":"赏","賠":"赔","賣":"卖",
  "賤":"贱","賦":"赋","質":"质","賬":"账","購":"购","賽":"赛","贈":"赠","贊":"赞","趙":"赵","趕":"赶","趨":"趋","跡":"迹",
  "踐":"践","蹤":"踪","軀":"躯","車":"车","軌":"轨","軍":"军","軟":"软","較":"较","輛":"辆","輕":"轻","輝":"辉","輩":"辈",
  "輪":"轮","輸":"输","轉":"转","轟":"轰","辦":"办","辭":"辞","邊":"边","遞":"递","遠":"远","違":"违","連":"连","遲":"迟",
  "遊":"游","運":"运","過":"过","達":"达","違":"违","遷":"迁","選":"选","遺":"遗","遼":"辽","邁":"迈","還":"还","邇":"迩",
  "鄉":"乡","鄭":"郑","鄰":"邻","醫":"医","釋":"释","針":"针","釣":"钓","鈔":"钞","鈕":"钮","鈴":"铃","鉛":"铅","銀":"银",
  "銅":"铜","銷":"销","鋁":"铝","鋼":"钢","錄":"录","錢":"钱","錯":"错","錦":"锦","鍊":"炼","鍋":"锅","鍾":"钟","鎖":"锁",
  "鎮":"镇","鏡":"镜","鐵":"铁","鑑":"鉴","鑽":"钻","長":"长","門":"门","閃":"闪","閉":"闭","開":"开","閒":"闲","間":"间",
  "閣":"阁","閨":"闺","關":"关","闖":"闯","闡":"阐","陣":"阵","陰":"阴","陳":"陈","陸":"陆","陽":"阳","隉":"陧","隊":"队",
  "階":"阶","隨":"随","險":"险","隱":"隐","隻":"只","難":"难","雛":"雏","雙":"双","雞":"鸡","離":"离","雜":"杂","霧":"雾",
  "靈":"灵","靜":"静","靠":"靠","響":"响","頁":"页","頂":"顶","項":"项","順":"顺","須":"须","頑":"顽","頓":"顿","預":"预",
  "領":"领","頰":"颊","頭":"头","顏":"颜","願":"愿","類":"类","顧":"顾","顯":"显","風":"风","飛":"飞","飯":"饭","飲":"饮",
  "飽":"饱","餘":"余","養":"养","館":"馆","馬":"马","駐":"驻","駕":"驾","驚":"惊","驅":"驱","驗":"验","體":"体","髮":"发",
  "鬆":"松","鬥":"斗","鬧":"闹","魯":"鲁","鮮":"鲜","鳥":"鸟","鳳":"凤","鳴":"鸣","鴨":"鸭","鴻":"鸿","龍":"龙","龜":"龟"
};

function convertTextToSimplified(str){
  return str.split("").map(ch => tcToScMap[ch] || ch).join("");
}

function getChineseTextBlocks(){
  return Array.from(document.querySelectorAll('section.text-block[data-lang="zh"]'));
}

function applyTcSc(){
  getChineseTextBlocks().forEach(block => {
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (!tcOriginalText.has(node)) tcOriginalText.set(node, node.nodeValue);
      node.nodeValue = tcScState.simplified ? convertTextToSimplified(tcOriginalText.get(node)) : tcOriginalText.get(node);
    });
  });
}

function refreshTcScButton(){
  const btn = document.getElementById("tcScBtn");
  if (!btn) return;
  btn.innerHTML = tcScState.simplified
    ? '<span class="main">恢復繁體</span><span class="sub">Back to TC</span>'
    : '<span class="main">繁體/簡體</span><span class="sub">TC/SC</span>';
  btn.classList.toggle("active", tcScState.simplified);
}

function toggleTcSc(){
  tcScState.simplified = !tcScState.simplified;
  applyTcSc();
  refreshTcScButton();
}

window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("tcScBtn");
  if (btn) {
    btn.addEventListener("click", toggleTcSc);
    refreshTcScButton();
  }
});


/* V0.9B SAFE - Read Aloud / Stop Reading */
const readAloudState = { reading: false };

function getCurrentReadableText(){
  const visibleBlocks = Array.from(document.querySelectorAll("section.text-block"))
    .filter(el => !el.classList.contains("hidden"));
  if (!visibleBlocks.length) return "";
  return visibleBlocks.map(el => el.innerText || el.textContent || "").join("\n\n").trim();
}

function refreshReadAloudButton(){
  const btn = document.getElementById("readAloudBtn");
  if (!btn) return;
  btn.innerHTML = readAloudState.reading
    ? '<span class="main">停止朗讀</span><span class="sub">Stop Reading</span>'
    : '<span class="main">開始朗讀</span><span class="sub">Read Aloud</span>';
  btn.classList.toggle("active", readAloudState.reading);
}

function stopReadAloud(){
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  readAloudState.reading = false;
  refreshReadAloudButton();
}

function startReadAloud(){
  if (!("speechSynthesis" in window)) {
    alert("This browser does not support read-aloud.");
    return;
  }
  const text = getCurrentReadableText();
  if (!text) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.5;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  utterance.lang = (typeof state !== "undefined" && state.lang === "en") ? "en-US" : "zh-TW";

  utterance.onend = () => { readAloudState.reading = false; refreshReadAloudButton(); };
  utterance.onerror = () => { readAloudState.reading = false; refreshReadAloudButton(); };

  readAloudState.reading = true;
  refreshReadAloudButton();
  window.speechSynthesis.speak(utterance);
}

function toggleReadAloud(){
  if (readAloudState.reading) stopReadAloud();
  else startReadAloud();
}

window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("readAloudBtn");
  if (btn) {
    btn.addEventListener("click", toggleReadAloud);
    refreshReadAloudButton();
  }
});
window.addEventListener("beforeunload", () => stopReadAloud());


/* YLA GLOBAL LIGHTBOX V2 */
(function(){
  let overlay = null;
  let overlayImage = null;
  let previousHtmlOverflow = '';
  let previousBodyOverflow = '';

  function ensureOverlay(){
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'yla-global-lightbox';
    overlay.setAttribute('aria-hidden','true');
    overlay.setAttribute('role','dialog');

    overlayImage = document.createElement('img');
    overlayImage.alt = '';
    overlayImage.draggable = false;
    overlay.appendChild(overlayImage);

    overlay.addEventListener('click', closeYlaLightbox);
    overlayImage.addEventListener('click', function(event){
      event.stopPropagation();
      closeYlaLightbox();
    });
    document.body.appendChild(overlay);
  }

  function openYlaLightbox(img){
    if (!img) return;
    ensureOverlay();
    previousHtmlOverflow = document.documentElement.style.overflow;
    previousBodyOverflow = document.body.style.overflow;
    overlayImage.src = img.currentSrc || img.src;
    overlayImage.alt = img.alt || '';
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function closeYlaLightbox(){
    if (!overlay || !overlay.classList.contains('open')) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden','true');
    overlayImage.removeAttribute('src');
    document.documentElement.style.overflow = previousHtmlOverflow;
    document.body.style.overflow = previousBodyOverflow;
  }

  window.openYlaLightbox = openYlaLightbox;
  window.closeYlaLightbox = closeYlaLightbox;

  document.addEventListener('click', function(event){
    const img = event.target.closest('img.article-hero, .article-illustration img, img[data-enlargeable="true"]');
    if (!img || img.id === 'ylaLightboxImage') return;
    event.preventDefault();
    openYlaLightbox(img);
  });

  document.addEventListener('keydown', function(event){
    if (event.key === 'Escape') closeYlaLightbox();
  });
})();
