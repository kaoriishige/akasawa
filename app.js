/*
  塩原温泉 赤沢温泉旅館
  CEOコパイロット ✕ ②集客・マーケAI ✕ ④リピートCRM AI ✕ ⑦データ統合・分析AI
  自動運営デモシステム JavaScript (3AI連動・データ統合版)
*/
// グローバル変数
let geminiApiKey = "";
let autopilotInterval = null;
let isRunningAutopilot = false;
let mvvText = "";
let consultingText = "";
// 宿のファクトデータベース
const ryokanFacts = {
  name: "塩原温泉 赤沢温泉旅館",
  tel: "0287-46-5700",
  address: "〒329-2921 栃木県那須塩原市塩原1149",
  details: {
    onsen: "自家源泉かけ流しの「ぬる湯」（源泉44℃、浴槽38〜40℃）。長湯に最適で自律神経を整える温泉。",
    cats: "みーちゃん、ちびちゃん、ハチ、さくらの看板猫4匹がお出迎え。保護猫活動にも注力。",
    chef: "中国人シェフによる創作中華。木金日限定でヴィーガン中華コースを提供。川魚は炭火で焼きたて提供。",
    view: "箒川（ほうきがわ）の目の前、全室リバービューで川のせせらぎが聞こえる静かな全10室の小宿。"
  }
};
// 顧客データベース（ダミーデータ）
const customerDatabase = [
  { id: 1, name: "佐藤 健二 様", visits: 5, lastVisit: "2026-03-12", tags: ["cats", "onsen"], prob: 75 },
  { id: 2, name: "リン・チェン 様 (台湾)", visits: 2, lastVisit: "2026-04-05", tags: ["onsen", "vegan"], prob: 60 },
  { id: 3, name: "田中 美咲 様", visits: 12, lastVisit: "2026-05-10", tags: ["cats", "vip"], prob: 95 },
  { id: 4, name: "鈴木 拓海 様", visits: 1, lastVisit: "2025-11-20", tags: ["onsen"], prob: 30 },
  { id: 5, name: "高橋 陽子 様", visits: 3, lastVisit: "2026-02-28", tags: ["vegan"], prob: 50 },
  { id: 6, name: "ジェームズ・スミス 様", visits: 1, lastVisit: "2026-04-18", tags: ["onsen", "vegan"], prob: 45 },
  { id: 7, name: "渡辺 裕太 様", visits: 8, lastVisit: "2026-05-01", tags: ["cats", "onsen", "vip"], prob: 88 },
  { id: 8, name: "小林 杏奈 様", visits: 2, lastVisit: "2025-08-15", tags: ["cats"], prob: 20 },
  { id: 9, name: "チャン・ワイマン 様 (香港)", visits: 1, lastVisit: "2026-03-25", tags: ["cats", "vegan"], prob: 55 },
  { id: 10, name: "加藤 雅也 様", visits: 15, lastVisit: "2026-05-18", tags: ["onsen", "vip"], prob: 98 }
];
// モックデータ定義
const mockSolutions = {
  cats: {
    hp_summary: `<!-- AI Overviews & 看板猫ブロック -->
<div class="ryokan-summary-block" style="border: 2px solid #d4af37; background: #faf8f5; padding: 20px; border-radius: 12px; font-family: 'Noto Serif JP', serif; color: #333;">
  <h2 style="color: #1b3b2b; font-size: 20px; margin-top: 0; border-bottom: 2px solid #1b3b2b; padding-bottom: 8px;">看板猫4匹とふれあう癒やしの温泉宿</h2>
  <p style="font-size: 15px; line-height: 1.7; margin-bottom: 15px;">
    当館は<strong>「みーちゃん」「ちびちゃん」「ハチ」「さくら」の4匹の個性豊かな看板猫</strong>が暮らす、猫好きにはたまらない温泉旅館です。ロビーでのふれあいはもちろん、保護猫活動を支援するストーリーもあり、将来的な保護猫カフェ併設に向けて取り組んでいます。猫アレルギーのお客様向けには、空気清浄機の設置や入念な清掃を徹底したお部屋をご案内しています。
  </p>
</div>`,
    hp_jsonld: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "name": "塩原温泉 赤沢温泉旅館",
  "telephone": "0287-46-5700",
  "address": {
    "@type": "PostalAddress",
    "postalCode": "329-2921",
    "addressRegion": "栃木県",
    "addressLocality": "那須塩原市",
    "streetAddress": "塩原1149"
  },
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "看板猫4匹在籍(みーちゃん他)", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "保護猫支援活動", "value": true }
  ]
}
<\/script>`,
    gbp_post: `【看板猫みーちゃんのまったり日常日記 ＆ 保護猫カフェプロジェクト】
ロビーの特等席でお昼寝中の看板猫「みーちゃん」をお届けします🐱
当館は保護猫4匹が元気に働いており、売上の一部は保護猫活動に役立てられています。将来の「保護猫カフェ併設」に向けて一歩ずつ進んでいます。
猫好きのお客様限定のプランや特典もご用意しておりますので、ぜひ猫ちゃんたちに会いに来てくださいね！
#塩原温泉 #赤沢温泉旅館 #看板猫 #保護猫活動 #猫のいる暮らし`,
    gbp_img_desc: "ストーブの前で丸まって気持ちよさそうに眠るみーちゃんのドアップ写真",
    insta_post: `今日のロビーのアイドル、ちびちゃんです🐾
お客様がお越しになると、トコトコと寄っていってご挨拶するのが得意な甘えん坊さん。
当館自慢の「ぬる湯」で心ゆくまで温まった後は、ロビーで猫ちゃんたちとふれあって、最高の癒やしタイムをお過ごしください。
Mascot cat "Chibi-chan" greeting our guests at the lobby! Come and be healed by our natural hot spring and friendly cats. 🐱♨️
#赤沢温泉旅館 #塩原温泉 #看板猫 #猫のいる宿 #保護猫 #猫好きさんと繋がりたい #CatLovers #NasuShiobara #RyokanCat #CatsOfInstagram`,
    line_post: `【猫好きの皆様へ限定🐈】いつも赤沢温泉旅館を応援いただきありがとうございます。
看板猫「みーちゃん」「ちびちゃん」たちから日頃の感謝を込めて、猫ちゃん大好きリピーター様限定の『オリジナル猫おやつ差し入れ特典付きプラン』のシークレットクーポンをお送りします！
ご宿泊時にこの画面を見せていただくと、猫ちゃんに直接おやつをあげられる「おやつセット」をプレゼントいたします。また会いにお越しくださいにゃん🐾`,
    report: `【データ統合分析AI・経営改善提言レポート】
対象施策：猫好きリピート促進対策
データ抽出期間：本日（リアルタイム同期）
1. 施策実施効果（速報値）
- 集客チャネル露出度：SNSでの猫ちゃん投稿が好調で、インプレッション数が前週比 +24% と急拡大しています。
- CRM顧客応答：LINEによる「猫おやつ付きプラン」クーポン配信により、LINE友だちの開封率が 68% を突破。
2. 顧客データベース相関分析
- 「猫好き (cats)」タグを持つ佐藤様、田中様、渡辺様の次回再来店予測スコアが軒並み 5〜10% 向上しました。
- アンケート満足度（ポジティブ率）も、猫ちゃんとの触れ合い報告の増加により 75% ➔ 88% へと改善しています。
3. 経営戦略・次回への提言
- 猫好き顧客のリピート率は非常に高いため、次回予約時の「お部屋への看板猫派遣サービス（アレルギーがないお客様限定）」などのさらなるプレミアム体験オプションを新設することで、客単価アップが期待できます。
- 露出増加に伴い、猫アレルギーについての懸念問い合わせも微増しているため、HPのFAQにおける「アレルギー対策と客室隔離の取り組み」の記述をさらに強化することを推奨します。`
  },
  summer: {
    hp_summary: `<!-- AI Overviews & 夏のぬる湯ブロック -->
<div class="ryokan-summary-block" style="border: 2px solid #d4af37; background: #faf8f5; padding: 20px; border-radius: 12px; font-family: 'Noto Serif JP', serif; color: #333;">
  <h2 style="color: #1b3b2b; font-size: 20px; margin-top: 0; border-bottom: 2px solid #1b3b2b; padding-bottom: 8px;">夏こそ入りたい、源泉かけ流しの「ぬる湯」</h2>
  <p style="font-size: 15px; line-height: 1.7; margin-bottom: 15px;">
    栃木県塩原温泉郷の箒川沿いに位置する当館は、<strong>38〜40℃の自家源泉かけ流し「ぬる湯」</strong>が最大の魅力です。熱い温泉とは異なり、体に負担をかけずに1時間以上じっくり長湯ができ、夏の湯あたりや冷え性防止、自律神経の回復に最適です。川の心地よいせせらぎを聞きながら、心身を解きほぐす極上の長湯をご体験いただけます。
  </p>
</div>`,
    hp_jsonld: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "name": "塩原温泉 赤沢温泉旅館",
  "telephone": "0287-46-5700",
  "address": {
    "@type": "PostalAddress",
    "postalCode": "329-2921",
    "addressRegion": "栃木県",
    "addressLocality": "那須塩原市",
    "streetAddress": "塩原1149"
  },
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "自家源泉100%ぬる湯かけ流し(38-40℃)", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "全室リバービューの静かな環境", "value": true }
  ]
}
<\/script>`,
    gbp_post: `【夏の暑さに疲れた心身に。極上の「ぬる湯長湯」のご案内】
外は暑くても、エアコンや冷たいもので体の中は冷えがちです。当館の温泉は浴槽で「38〜40℃」に調整された自家源泉かけ流しのぬる湯。
心臓や体に負担をかけずにのんびり湯船に浸かることで、自律神経が整い、夏の睡眠不足や疲労もスッキリ解消します。せせらぎを聞きながらの「長湯体験」、ぜひお試しください。
#塩原温泉 #赤沢温泉旅館 #ぬる湯 #源泉かけ流し #湯治 #夏の冷え性 #温泉旅行`,
    gbp_img_desc: "湯気がほんのり漂う、川のせせらぎが目の前に広がる岩露天風呂の写真",
    insta_post: `夏こそ、じっくり長湯の「ぬる湯」です♨️
当館の自家源泉は湯船で約39℃。熱すぎないからこそ、1時間でものんびりと温泉に浸かることができます。川風を感じながら、夏の疲れをリセットしに来ませんか？
Cool and cozy hot spring for hot summer! Our natural spring "Nuru-yu" (39°C) is perfect for long, relaxing baths. Feel the river breeze and unwind. 🍃
#赤沢温泉旅館 #塩原温泉 #ぬる湯 #長湯 #源泉かけ流し #露天風呂 #夏旅 #自律神経を整える #温泉療法 #NasuShiobara #OnsenHealing`,
    line_post: `【夏休み平日限定・ぬる湯満喫リピートクーポン】
赤沢温泉旅館の「ぬる湯」をいつもご愛顧いただきありがとうございます。
うだるような夏の暑さを乗り切るための「長湯プラン」をご用意しました。
本クーポンをご利用のうえ、夏休みの平日にご宿泊いただいたリピーター様には、ご夕食時に「地酒の冷酒一合」または「ノンアルコール果汁サイダー」を大人人数分無料サービスいたします！
心地よい川の風と、猫ちゃんたちがお待ちしております。`,
    report: `【データ統合分析AI・経営改善提言レポート】
対象施策：夏のぬる湯長湯アピールプラン
データ抽出期間：本日（リアルタイム同期）
1. 施策実施効果（速報値）
- 集客チャネル露出度：InstagramとGoogleマップ上での「ぬる湯・長湯」紹介の閲覧数が前月比 +38% を記録。特に30代〜50代の「自律神経の乱れ・疲労蓄積」への訴求が効果を発揮。
- 新規予約件数：夏休みの平日枠に対する公式HP経由の新規WEB予約が本日までに前年同月比 +15% 増加。
2. 顧客データベース相関分析
- 「ぬる湯 (onsen)」タグを持つ佐藤様、鈴木様、渡辺様の再来店予測確率が向上。
- LINEクーポン「平日冷酒特典」の配布後、3日以内でのリピート予約問い合わせが数件発生しました。
3. 経営戦略・次回への提言
- 平日の稼働率向上が顕著に表れているため、この期間を対象とした「温泉ソムリエによるぬる湯入浴法ミニガイド」などのコンテンツをHPに追加すると、さらに宿泊満足度が向上します。
- 夏休みの休前日（土曜・祝前日）は既にほぼ満室のため、マーケティングの広告バナーやSNS発信の対象を「平日限定」にさらに絞り込むことで、広告費用の最適化（CPA削減）が可能です。`
  }
};
// ナレッジベースの読み込み
async function loadKnowledgeBase() {
  try {
    const mvvRes = await fetch("data/mvv.txt");
    if (mvvRes.ok) {
      mvvText = await mvvRes.text();
      console.log("Loaded MVV Knowledge Base");
    }
    const consultingRes = await fetch("data/consulting.txt");
    if (consultingRes.ok) {
      consultingText = await consultingRes.text();
      console.log("Loaded Consulting Knowledge Base");
    }
  } catch (e) {
    console.error("Failed to load knowledge base files", e);
  }
}
// 起動時の初期化
document.addEventListener("DOMContentLoaded", async () => {
  initTabs();
  await loadConfig();
  await loadKnowledgeBase();
  renderCustomerTable("all");
  initEventHandlers();
});
// 1. タブ切り替えロジック
function initTabs() {
  const navBtns = document.querySelectorAll(".nav-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      navBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(tab => tab.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(targetTab).classList.add("active");
    });
  });
  // MARKETING用のサブタブ
  const subTabBtns = document.querySelectorAll(".sub-tab-btn");
  subTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetSubTab = btn.getAttribute("data-subtab");
      const parent = btn.parentElement;
      parent.querySelectorAll(".sub-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const contentsContainer = parent.parentElement;
      contentsContainer.querySelectorAll(".sub-tab-content").forEach(c => c.classList.remove("active"));
      document.getElementById("subtab-" + targetSubTab).classList.add("active");
      renderMarketingVisualPreview(targetSubTab);
    });
  });
}
// 2. config 読み込み (.env からの fetch 含む)
async function loadConfig() {
  try {
    const response = await fetch(".env");
    if (response.ok) {
      const text = await response.text();
      const match = text.match(/GEMINI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) {
        geminiApiKey = match[1].trim();
        console.log("Loaded API Key from .env");
      }
    }
  } catch (e) {
    console.log("Could not read .env file via fetch. Checking LocalStorage.");
  }
  const savedKey = localStorage.getItem("ryokan-gemini-key");
  if (savedKey) {
    geminiApiKey = savedKey;
  }
  updateApiStatusUI();
}
function updateApiStatusUI() {
  const apiDot = document.getElementById("api-status-dot");
  const apiText = document.getElementById("api-status-text");
  const keyInput = document.getElementById("api-key-input");
  if (geminiApiKey) {
    if (keyInput) keyInput.value = geminiApiKey;
    apiDot.classList.add("connected");
    apiText.innerText = "APIキー接続完了 (AI生成有効)";
  } else {
    apiDot.classList.remove("connected");
    apiText.innerText = "APIキー未設定 (モックモード)";
  }
}
// 3. 顧客テーブルの描画
function renderCustomerTable(segment = "all") {
  const tbody = document.getElementById("crm-customer-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  const filtered = customerDatabase.filter(c => {
    if (segment === "all") return true;
    if (segment === "cats") return c.tags.includes("cats");
    if (segment === "onsen") return c.tags.includes("onsen");
    if (segment === "vegan") return c.tags.includes("vegan");
    return true;
  });
  filtered.forEach(c => {
    const tr = document.createElement("tr");
    const tagsHtml = c.tags.map(t => {
      let label = t;
      let cl = "crm-tag";
      if (t === "cats") { label = "🐱 猫好き"; cl += " tag-cat"; }
      if (t === "onsen") { label = "♨️ ぬる湯"; cl += " tag-onsen"; }
      if (t === "vegan") { label = "🥗 中華・ヴィーガン"; cl += " tag-vegan"; }
      if (t === "vip") { label = "💎 VIP"; cl += " tag-vip"; }
      return `<span class="${cl}">${label}</span>`;
    }).join("");
    let probColor = "var(--danger)";
    if (c.prob >= 70) probColor = "var(--success)";
    else if (c.prob >= 50) probColor = "var(--warning)";
    tr.innerHTML = `
      <td style="padding: 0.75rem;"><strong>${c.name}</strong></td>
      <td style="padding: 0.75rem;">${c.visits}回</td>
      <td style="padding: 0.75rem; color: var(--text-secondary);">${c.lastVisit}</td>
      <td style="padding: 0.75rem;">${tagsHtml}</td>
      <td style="padding: 0.75rem; font-weight: bold; color: ${probColor};">${c.prob}%</td>
    `;
    tbody.appendChild(tr);
  });
}
// 4. イベントハンドラーの設定
// 4. イベントハンドラーの設定
function initEventHandlers() {
  // 設定モーダル
  const modal = document.getElementById("settings-modal");
  const openBtn = document.getElementById("open-settings-btn");
  const closeBtn = document.getElementById("close-settings-btn");
  const saveBtn = document.getElementById("save-settings-btn");
  const testBtn = document.getElementById("test-api-btn");
  if (openBtn) openBtn.addEventListener("click", () => modal.classList.add("active"));
  if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.remove("active"));
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("active");
    });
  }
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const keyVal = document.getElementById("api-key-input").value.trim();
      if (keyVal) {
        localStorage.setItem("ryokan-gemini-key", keyVal);
        geminiApiKey = keyVal;
      } else {
        localStorage.removeItem("ryokan-gemini-key");
        geminiApiKey = "";
      }
      updateApiStatusUI();
      modal.classList.remove("active");
      alert("API設定を保存しました。");
    });
  }
  if (testBtn) {
    testBtn.addEventListener("click", async () => {
      const keyVal = document.getElementById("api-key-input").value.trim();
      const resultSpan = document.getElementById("api-test-result");
      if (!keyVal) {
        resultSpan.style.color = "var(--danger)";
        resultSpan.innerText = "⚠️ キーが入力されていません。";
        return;
      }
      resultSpan.style.color = "var(--warning)";
      resultSpan.innerText = "⏳ 接続テスト中...";
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyVal}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
        });
        if (response.ok) {
          resultSpan.style.color = "var(--success)";
          resultSpan.innerText = "✅ 接続成功！利用可能です。";
        } else {
          resultSpan.style.color = "var(--danger)";
          resultSpan.innerText = "❌ 接続失敗。無効なキーです。";
        }
      } catch (e) {
        resultSpan.style.color = "var(--danger)";
        resultSpan.innerText = "❌ エラー: " + e.message;
      }
    });
  }
  // CRMセグメントフィルター
  const segBtns = document.querySelectorAll(".segment-btn");
  segBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      segBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const seg = btn.getAttribute("data-segment");
      renderCustomerTable(seg);
    });
  });
  // 手動実行ボタン群 (tab-marketing / tab-crm からの動作)
  const applyHpBtn = document.getElementById("run-hp-apply-btn");
  if (applyHpBtn) {
    applyHpBtn.addEventListener("click", () => {
      alert("公式HPに改善コードを反映しました！");
      setAgentDeptState("mkt", "completed");
    });
  }
  const postGbpBtn = document.getElementById("run-gbp-post-btn");
  if (postGbpBtn) {
    postGbpBtn.addEventListener("click", () => {
      alert("Googleビジネスプロフィールへ最新投稿を公開しました！");
      setAgentDeptState("mkt", "completed");
    });
  }
  const postInstaBtn = document.getElementById("run-insta-post-btn");
  if (postInstaBtn) {
    postInstaBtn.addEventListener("click", () => {
      alert("Instagramへの投稿を公開しました！");
      setAgentDeptState("mkt", "completed");
    });
  }
  const sendLineBtn = document.getElementById("run-line-send-btn");
  if (sendLineBtn) {
    sendLineBtn.addEventListener("click", () => {
      alert("LINEメッセージを一斉送信しました！");
      setAgentDeptState("crm", "completed");
      triggerTrendImprovement();
    });
  }
  const copyReportBtn = document.getElementById("copy-integration-report-btn");
  if (copyReportBtn) {
    copyReportBtn.addEventListener("click", () => {
      copyText("integration-report-output");
    });
  }
  // --- COO AI チャットハンドラー追加 ---
  const sendChatBtn = document.getElementById("send-chat-btn");
  const chatInput = document.getElementById("coo-chat-input");
  if (sendChatBtn && chatInput) {
    sendChatBtn.addEventListener("click", () => handleCooChatSend());
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleCooChatSend();
      }
    });
  }
  const shortcutBtns = document.querySelectorAll(".shortcut-btn");
  shortcutBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const query = btn.getAttribute("data-query");
      const preset = btn.getAttribute("data-preset");
      if (chatInput) {
        chatInput.value = query;
      }
      if (btn.classList.contains("execute-shortcut") && preset) {
        addChatBubble(query, "user");
        executeCooIntegratedAction(query, preset);
      } else {
        addChatBubble(query, "user");
        respondToCooChat(query);
      }
    });
  });
}
// 5. チャット表示用ユーティリティ
function addChatBubble(text, sender) {
  const container = document.getElementById("coo-chat-messages");
  if (!container) return;
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}-bubble`;
  const meta = document.createElement("div");
  meta.className = "bubble-meta";
  meta.innerText = sender === "agent" ? "🤖 COO AI エージェント" : "👤 ユーザー (スタッフ/経営者)";
  const body = document.createElement("div");
  body.className = "bubble-text";
  // Convert newlines to br tags
  body.innerHTML = text.replace(/\n/g, "<br>");
  bubble.appendChild(meta);
  bubble.appendChild(body);
  container.appendChild(bubble);
  // Auto-scroll
  container.scrollTop = container.scrollHeight;
}
// 6. COO AI 統合アクション実行 (チャット連動・3AI自律実行)
async function executeCooIntegratedAction(instruction, presetKey) {
  if (isRunningAutopilot) return;
  const logContainer = document.getElementById("agent-log-container");
  const statusBadge = document.getElementById("agent-status-badge");
  const sendChatBtn = document.getElementById("send-chat-btn");
  // 初期化
  if (logContainer) logContainer.innerHTML = "";
  isRunningAutopilot = true;
  if (statusBadge) {
    statusBadge.innerText = "自律処理中";
    statusBadge.classList.add("active");
  }
  if (sendChatBtn) sendChatBtn.disabled = true;
  // エージェント相関図のインジケーターをリセット
  resetAllAgentDepts();
  // ログ出力用ヘルパー
  const addLog = (text, type = "system-msg") => {
    if (!logContainer) return;
    const div = document.createElement("div");
    div.className = `log-line ${type}`;
    div.innerText = `[${new Date().toLocaleTimeString()}] ${text}`;
    logContainer.appendChild(div);
    logContainer.scrollTop = logContainer.scrollHeight;
  };
  addLog("👔 CEO経営指示を受信しました。COO AIが統合処理を開始します。", "coo-msg");
  addLog("🏢 [コンセプト・経営戦略室] 連携要請を受信。", "system-msg");
  addLog("🛠️ [Skill] 「経営ビジョン(MVV)整合性チェック」を発動中...", "system-msg");
  setAgentDeptState("mvv", "active-thinking");
  await sleep(1200);
  setAgentDeptState("mvv", "completed");
  addLog("✅ [コンセプト・経営戦略室] 施策が宿のMVVおよびターゲット層と一致していることを確認。", "success-msg");
  // CRM側のセグメント反映
  let crmSegment = "all";
  if (presetKey === "cats") crmSegment = "cats";
  else if (presetKey === "summer") crmSegment = "onsen";
  // セグメントフィルターUIの連動
  document.querySelectorAll(".segment-btn").forEach(b => {
    if (b.getAttribute("data-segment") === crmSegment) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });
  renderCustomerTable(crmSegment);
  const targetSegmentLabel = document.getElementById("crm-target-segment-label");
  if (targetSegmentLabel) {
    targetSegmentLabel.value = crmSegment === "cats" ? "猫好き顧客 (4名)" : (crmSegment === "onsen" ? "ぬる湯ファン顧客 (5名)" : "全顧客 (10名)");
  }
  // AIによるコンテンツ生成 (API連携 or モック)
  let generatedData = null;
  addLog("🧠 COO AI：各組織エージェントへの指示とコンテンツ生成を開始します...", "coo-msg");
  if (geminiApiKey) {
    addLog("🌐 Gemini APIと接続。リアルタイムコンテンツ生成中...", "coo-msg");
    generatedData = await generateAiContentWithGemini(instruction, presetKey, addLog);
  } else {
    addLog("💡 APIキー未設定のため、高品質ローカルデータベースからマッチングを行います...", "coo-msg");
    await sleep(1500);
    generatedData = mockSolutions[presetKey];
  }
  if (!generatedData) {
    addLog("❌ コンテンツ生成に失敗しました。モックデータに切り替えます。", "err-msg");
    generatedData = mockSolutions[presetKey];
  }
  // 生成されたデータを各テキストエリアに流し込む
  document.getElementById("marketing-hp-summary-output").value = generatedData.hp_summary;
  document.getElementById("marketing-hp-jsonld-output").value = generatedData.hp_jsonld;
  document.getElementById("marketing-gbp-post-output").value = generatedData.gbp_post;
  document.getElementById("marketing-insta-post-output").value = generatedData.insta_post;
  document.getElementById("crm-line-msg-output").value = generatedData.line_post;
  const imgDescEl = document.getElementById("marketing-gbp-img-desc");
  if (imgDescEl) {
    imgDescEl.innerText = generatedData.gbp_img_desc || "宿の象徴的なアセット写真（猫または温泉）";
  }
  // プレビューの自動切り替え
  renderMarketingVisualPreview("marketing-hp");
  // 自律実行フェーズ
  addLog("📢 [集客・マーケ部] 連携要請を受信。コンテンツ自動作成を開始します。", "mkt-msg");
  addLog("🛠️ [Skill] 「AI検索・SEO対策」「MEO・Googleマップ定期投稿」「SNS投稿案作成」を発動中...", "system-msg");
  setAgentDeptState("mkt", "active-thinking");
  await sleep(1500);
  setAgentDeptState("mkt", "completed");
  addLog("📢 [集客・マーケ部] [実行] HP結論ブロック設置、構造化データ(JSON-LD)反映、GBP予約公開、Instagram投稿連携を完了しました。", "success-msg");
  addLog("🏨 [宿泊満足度・サービス部] 連携要請を受信。現場おもてなし品質のチェックを開始。", "coo-msg");
  addLog("🛠️ [Skill] 「客室清掃チェックシート監査」「ぬる湯おもてなしガイド」を発動中...", "system-msg");
  setAgentDeptState("srv", "active-thinking");
  await sleep(1200);
  setAgentDeptState("srv", "completed");
  addLog("🏨 [宿泊満足度・サービス部] [実行] 口コミ改善項目(清掃見える化、ぬる湯案内)の同期およびおもてなしマニュアルの更新を完了しました。", "success-msg");
  addLog("🔁 [リピートCRM部] ターゲット顧客の抽出およびLINE配信メッセージ準備完了。", "crm-msg");
  setAgentDeptState("crm", "active-thinking");
  await sleep(1500);
  setAgentDeptState("crm", "completed");
  addLog("🔁 [リピートCRM部] [実行] ターゲット顧客(セグメント)の抽出およびLINE公式経由での限定クーポン一斉配信を完了しました。", "success-msg");
  if (presetKey === "cats") {
    document.getElementById("crm-pos-percentage").innerText = "88%";
    document.getElementById("crm-pos-label").innerText = "88% (44件)";
  }
  addLog("📊 [財務・データ統合分析室] 連携要請を受信。チャネルパフォーマンスの集計を開始します。", "coo-msg");
  addLog("🛠️ [Skill] 「データ自動同期・集計」「AI経営改善レポート自動生成」を発動中...", "system-msg");
  setAgentDeptState("ana", "active-thinking");
  await sleep(1500);
  setAgentDeptState("ana", "completed");
  addLog("📊 [財務・データ統合分析室] [実行] チャネルデータの統合同期、ダッシュボード指標の更新、AI経営提言レポートの生成を完了しました。", "success-msg");
  // ダッシュボード更新
  if (presetKey === "cats") {
    document.getElementById("int-mkt-exposure").innerText = "15,840 回";
    document.getElementById("int-mkt-bookings").innerText = "92 件";
    document.getElementById("int-crm-line").innerText = "456 人";
    document.getElementById("int-crm-repeats").innerText = "35 件";
  } else if (presetKey === "summer") {
    document.getElementById("int-mkt-exposure").innerText = "17,180 回";
    document.getElementById("int-mkt-bookings").innerText = "98 件";
    document.getElementById("int-crm-line").innerText = "432 人";
    document.getElementById("int-crm-repeats").innerText = "31 件";
  }
  triggerTrendImprovement();
  // レポート流し込み
  document.getElementById("integration-report-output").innerText = generatedData.report;
  addLog("🏆 すべての自律駆動タスクが正常終了しました。", "success-msg");
  if (statusBadge) {
    statusBadge.innerText = "完了";
    statusBadge.classList.remove("active");
  }
  if (sendChatBtn) sendChatBtn.disabled = false;
  isRunningAutopilot = false;
  // チャットにも完了報告とレポートの要約をCOO AIとして投稿
  const chatResponse = `
【指示実行完了報告】
CEO、ご指示いただいた施策の自動実行がすべて完了しました！<br><br>
<strong>実行した連携タスク：</strong><br>
1. <strong>コンセプト戦略室</strong>: 施策の整合性確認<br>
2. <strong>集客・マーケ部</strong>: 公式HPへの要約HTML反映、構造化データ(JSON-LD)埋め込み、Googleマップ(GBP)定期投稿、Instagram投稿連携<br>
3. <strong>宿泊満足度部</strong>: 現場オペレーションの同期<br>
4. <strong>リピートCRM部</strong>: LINE公式アカウントでのセグメント配信（限定クーポン付）<br>
5. <strong>データ統合分析室</strong>: 効果測定シミュレーションおよびダッシュボード更新<br><br>
<strong>データ統合・分析AIによる経営レポート：</strong><br>
${generatedData.report.replace(/\n/g, "<br>")}
`;
  addChatBubble(chatResponse, "agent");
}
// 7. COO AI チャット送信ハンドラ
async function handleCooChatSend() {
  const chatInput = document.getElementById("coo-chat-input");
  if (!chatInput) return;
  const query = chatInput.value.trim();
  if (!query) return;
  // 入力を空にする
  chatInput.value = "";
  // ユーザーの発言を表示
  addChatBubble(query, "user");
  // 応答処理
  respondToCooChat(query);
}
// 8. COO AI 応答処理
async function respondToCooChat(query) {
  // チャット送信ボタンの無効化
  const sendChatBtn = document.getElementById("send-chat-btn");
  if (sendChatBtn) sendChatBtn.disabled = true;
  // COO AI が考えている状態を表示（相関図）
  const cooNode = document.getElementById("agent-node-coo");
  if (cooNode) cooNode.classList.add("active-thinking");
  // 施策の実行指示であるかどうかの簡易判定
  const isExecutionQuery = query.includes("施策") && (query.includes("実行") || query.includes("やって") || query.includes("送って"));
  if (isExecutionQuery) {
    let presetKey = "summer";
    if (query.includes("猫")) presetKey = "cats";
    // 施策実行
    if (cooNode) cooNode.classList.remove("active-thinking");
    await executeCooIntegratedAction(query, presetKey);
  } else {
    // 通常の質問回答
    let answer = "";
    // どの専門部署のナレッジに関係するか判定して相関図を光らせる
    let dept = "mvv";
    let skillName = "コンセプト・MVV整合性チェック";
    const q = query.toLowerCase();
    if (q.includes("清掃") || q.includes("チェック")) {
      dept = "srv";
      skillName = "客室清掃チェックシート管理・品質監査";
    } else if (q.includes("ぬる湯") || q.includes("効果") || q.includes("長湯")) {
      dept = "srv";
      skillName = "温泉おもてなし・ぬる湯説明ガイド";
    } else if (q.includes("猫") || q.includes("アレルギー") || q.includes("共生")) {
      dept = "srv";
      skillName = "猫共存ガイド・アレルギー対策";
    } else if (q.includes("料理") || q.includes("ヴィーガン") || q.includes("中華") || q.includes("テンポ")) {
      dept = "srv";
      skillName = "食事おもてなし・料理提供テンポ調整";
    } else if (q.includes("外国人") || q.includes("インバウンド") || q.includes("案内")) {
      dept = "srv";
      skillName = "インバウンド対応・多言語案内ガイド";
    } else if (q.includes("接客") || q.includes("おもてなし") || q.includes("マニュアル")) {
      dept = "srv";
      skillName = "宿泊満足度おもてなしナレッジ検索";
    } else if (q.includes("集客") || q.includes("hp") || q.includes("seo") || q.includes("sns") || q.includes("露出")) {
      dept = "mkt";
      skillName = "AI検索・SEO対策・SNS投稿案作成";
    } else if (q.includes("リピート") || q.includes("crm") || q.includes("line") || q.includes("会員") || q.includes("顧客") || q.includes("クーポン")) {
      dept = "crm";
      skillName = "リピートCRM・LINE公式メッセージ配信";
    } else if (q.includes("分析") || q.includes("財務") || q.includes("売上") || q.includes("ダッシュボード") || q.includes("レポート")) {
      dept = "ana";
      skillName = "財務・データ統合分析・AI経営レポート生成";
    }
    // ログへの出力
    const logContainer = document.getElementById("agent-log-container");
    const addLog = (text, type = "system-msg") => {
      if (!logContainer) return;
      const div = document.createElement("div");
      div.className = `log-line ${type}`;
      div.innerText = `[${new Date().toLocaleTimeString()}] ${text}`;
      logContainer.appendChild(div);
      logContainer.scrollTop = logContainer.scrollHeight;
    };
    if (logContainer) logContainer.innerHTML = "";
    addLog(`🧠 COO AI：質問を解析し、担当部署にSkillsの呼び出しを要求しました。`, "coo-msg");
    addLog(`🏢 担当部署: ${dept === "srv" ? "宿泊満足度・サービス部" : (dept === "mkt" ? "集客・マーケティング部" : (dept === "crm" ? "リピート・CRM推進部" : (dept === "ana" ? "財務・データ統合分析室" : "コンセプト・経営戦略室")))}`, "system-msg");
    addLog(`🛠️ 実行技能 (Skill): 「${skillName}」を発動中...`, "system-msg");
    setAgentDeptState(dept, "active-thinking");
    await sleep(1200);
    if (geminiApiKey) {
      answer = await generateCooKnowledgeResponse(query);
    } else {
      answer = getMockResponse(query);
    }
    setAgentDeptState(dept, "completed");
    addLog(`✅ 実行成功: 「${skillName}」に基づく回答をCOO AIに報告しました。`, "success-msg");
    if (cooNode) cooNode.classList.remove("active-thinking");
    addChatBubble(answer, "agent");
    await sleep(500);
    resetAllAgentDepts();
  }
  if (sendChatBtn) sendChatBtn.disabled = false;
}
// 9. Gemini API を使用した COO ナレッジRAG応答
async function generateCooKnowledgeResponse(query) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
  const systemInstruction = `
あなたは「塩原温泉 赤沢温泉旅館」の優秀なCOO AI（統括司令塔）です。
スタッフの質問や、経営者（CEO）からの指示に対して、当館の公式ミッション・コンセプトおよびコンサルティングデータをベースにして、具体的かつ実践的に回答してください。
当館の基本情報：
- ミッション：「猫との出会いと、ぬる湯の癒しで、心身をリセットする場を提供する」
- コンセプト：「猫とぬる湯と渓流にほどける、静養型ウェルネスの小宿」（猫 × ぬる湯 × 渓流 × 静養）
- 看板猫：みーちゃん、ちびちゃん、ハチ、さくら
- 温泉：自家源泉かけ流しの「ぬる湯」（38〜40℃）
当館のミッション・コンセプト詳細：
${mvvText}
当館のコンサルティングデータ・運営改善指針：
${consultingText}
【応答のルール】
1. スタッフからの現場業務に関する質問（清掃、接客、食事、ぬる湯、インバウンド等）には、コンサルデータの「3.宿泊満足度設計」等の具体的な改善ポイント（清掃の見える化、ヴィーガン中華の説明方法、アレルギー対策、ぬる湯の効果説明など）に基づいて、具体的かつ役立つアクションを提示してください。
2. 常に赤沢温泉旅館のスタッフや経営者に寄り添うトーンで、丁寧な日本語で回答してください。
3. HTMLタグは含めず、プレーンテキストまたは改行コード(\n)を使用して読みやすくフォーマットしてください。
`;
  const prompt = `
【スタッフ/経営者からの相談・質問】
"${query}"
上記に対して、COO AIとして的確かつ親身に回答してください。
`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: systemInstruction + "\n\n" + prompt }]
          }
        ]
      })
    });
    if (response.ok) {
      const resJson = await response.json();
      return resJson.candidates[0].content.parts[0].text.trim();
    } else {
      console.error(await response.text());
      return "申し訳ありません。専門エージェントとのリアルタイム通信でエラーが発生しました。現在、ローカルの知識ベースから代替の回答を準備しています。";
    }
  } catch (e) {
    console.error(e);
    return "通信エラーが発生しました。ネットワーク接続を確認してください。";
  }
}
// 10. API未設定（モックモード）時のローカルナレッジ回答
function getMockResponse(query) {
  const q = query.toLowerCase();
  if (q.includes("清掃") || q.includes("チェック")) {
    return `客室および館内清掃の品質向上については、コンサルティング報告書「3.宿泊満足度設計」に基づき、以下の対策を推奨します：\n\n1. **清掃完了チェックシートの導入**: 清掃担当者がチェックした項目を「清掃完了カード」として客室のテーブルの上に提示します。これにより、お客様に安心感を与え、清掃のムラを物理的に「見える化」して防ぐことができます。\n2. **露天風呂の清掃と藻対策の強化**: 朝と夕の湯温測定のタイミングで、必ず湯もみとネット清掃を行い、浮遊物を徹底して取り除きます。また、男女入替の時間帯の案内表示を脱衣所の目立つ場所に掲示し、お客様の誤侵入や不満を防ぎます。`;
  }
  if (q.includes("ぬる湯") || q.includes("効果") || q.includes("説明") || q.includes("長湯")) {
    return `当館の看板アセットである自家源泉「ぬる湯」の効果説明については、お客様に以下のように説明しておもてなししてください：\n\n* **説明のお手本**: 「当館の温泉は浴槽で38〜40℃に調整された自家源泉かけ流しのぬる湯です。熱い温泉と異なり、体に負担をかけずに30分〜1時間以上のんびりと長湯を楽しんでいただけます。これにより、副交感神経が優位になって自律神経のバランスが整い、夏の冷え性や不眠、日頃のお疲れを芯から癒すことができます。」\n* **接客時のコツ**: 箒川のせせらぎや鳥のさえずりを聞きながら、自然の音に耳を傾ける「静養」とセットでおすすめすると、満足度が非常に高まります。`;
  }
  if (q.includes("猫") || q.includes("アレルギー") || q.includes("共生") || q.includes("みーちゃん")) {
    return `看板猫たちとの共生およびアレルギーのお客様への対応について、おもてなしガイドラインを共有します：\n\n1. **アレルギー客向けの徹底的な棲み分け**: 猫アレルギーの懸念があるお客様には、事前に猫が入らないフロア・客室であることをお伝えし、客室には空気清浄機をあらかじめ最大風量で稼働させます。公式HPのFAQにもアレルギー対策についての取り組みを明記しています。\n2. **ロビーでのふれあいガイド**: 看板猫（みーちゃん、ちびちゃん、ハチ、さくら）とのふれあいはロビーのみとし、客室への出入りは禁止しています。また、無理な抱っこを控えるよう優しく案内するイラスト入り掲示物をロビーに設置します。\n3. **保護猫活動への貢献**: 当館の猫ちゃんたちは保護猫出身であり、売上の一部が動物愛護活動に寄付されているストーリーを折に触れてお客様にお伝えすると、感情的なつながり（リピーター化）が深まります。`;
  }
  if (q.includes("料理") || q.includes("ヴィーガン") || q.includes("中華") || q.includes("テンポ")) {
    return `当館の食事提供とおもてなしに関するマニュアルです：\n\n1. **食事提供テンポの調整**: じゃらん等の口コミで「食事提供のペースが早い/遅い」といったムラが指摘されています。接客スタッフは、お客様が各皿を食べ終えるタイミングを常に観察し、厨房とインカムや伝票でリアルタイムに連携して、次の料理（特に川魚の炭火焼など、焼きたてを提供すべきもの）を最適なタイミングで運んでください。\n2. **中華ヴィーガンコースの説明**: 木金日限定のヴィーガン中華コースは、動物性食材を一切使わず、那須高原野菜や大豆ミートを使用して本格中華のコクを表現しています。健康志向の方やアレルギー、外国人のお客様にそのこだわり（シェフの本格創作）をお伝えしてください。`;
  }
  if (q.includes("外国人") || q.includes("インバウンド") || q.includes("台湾") || q.includes("中国") || q.includes("案内")) {
    return `アジア圏（台湾・中国・香港など）からのウェルネス志向のお客様へのおもてなしと案内ガイドラインです：\n\n1. **多言語案内の設置**: 脱衣所でのスマートフォンの利用禁止や、体を洗ってから湯船に入ることなど、日本の温泉マナーを英語・繁体字中国語・簡体字中国語で分かりやすく示したラミネートを各所に掲示しています。非常時の避難経路についても多言語ガイドを用意しています。\n2. **一生懸命な接客姿勢**: 言葉の壁があっても、笑顔と丁寧なジェスチャー、そしてスマートフォンの翻訳アプリを駆使して「一生懸命におもてなしする姿勢」が、海外旅行客に極めて高く評価されています。スタッフ全員で温かい歓迎を表現しましょう。`;
  }
  if (q.includes("ミッション") || q.includes("ビジョン") || q.includes("コンセプト") || q.includes("mvv") || q.includes("要約")) {
    return `赤沢温泉旅館のミッション・ビジョン・バリュー・コンセプトの要約です：\n\n* **ミッション（使命）**: 「猫との出会いと、ぬる湯の癒しで、心身をリセットする場を提供する」\n* **ビジョン（将来像）**: 「渓流沿いの静寂の中で、猫と湯に包まれた、日本を代表するウェルネス温泉地へ」\n* **メインコンセプト**: 「猫とぬる湯と渓流にほどける、静養型ウェルネスの小宿」\n* **サブコンセプト**: 「猫医者の温泉——心と体を癒す、日本の隠れ家」\n* **ブランド・プロミス**: 「当館に来れば、猫との出会いとぬる湯の癒しで心身がリセットされ、日常に戻った時に新しい視点で人生を見つめ直せる」`;
  }
  if (q.includes("集客") || q.includes("ファネル") || q.includes("直販") || q.includes("mkt")) {
    return `コンサル資料「2.集客導線設計」に基づく、当館の集客ファネル改善と直販比率アップのポイントです：\n\n1. **公式HPでの「強みの最大化」**: AI検索（AI Overviews）で「那須塩原 ぬる湯 温泉」「猫のいる温泉旅館」と検索された際に上位に表示されるよう、HPのheadに「猫がいる」「自家源泉ぬる湯」などのカスタム構造化データ（JSON-LD）を埋め込み、HP最上部にはAIが瞬時に特徴を掴める「結論要約ブロック」を設置します。\n2. **GBP (Googleマイビジネス) とSNSの連動**: MEO対策として、Googleマップ上での最新の看板猫の様子や、ぬる湯の入浴法ガイドを定期的に投稿。Instagramと連動させて視覚的な露出を高め、新規客の獲得を図ります。\n3. **ベストレート保証による直販比率アップ**: OTA（じゃらん、Booking.com）からの流入客に対し、次回公式予約で最もお得になる「ベストレート保証」の案内を徹底し、手数料を抑えた自社サイト予約への移行を促します。`;
  }
  if (q.includes("リピーター") || q.includes("crm") || q.includes("会員") || q.includes("クーポン")) {
    return `コンサル資料「4.リピート設計」に基づく、当館のリピート対策とCRMのポイントです：\n\n1. **猫との感情的なつながりの強化**: 「また猫ちゃんに会いたい」という感情は最大のリピート動機です。宿泊時にLINE公式アカウントへの友だち登録を促し、「看板猫たちの日常」を定期配信します。\n2. **季節ごとの渓流・温泉提案**: 季節別の箒川の美しさ（新緑、紅葉、雪景色）や、季節ごとの「ぬる湯」の温度管理へのこだわりをLINEで提案し、リピートのきっかけを作ります。\n3. **セグメントLINE配信**: 猫好きタグのお客様には「猫おやつ特典付きプラン」、温泉ファンのお客様には「平日限定地酒付きプラン」など、顧客データベースの嗜好タグに基づいたパーソナライズクーポンを配信し、リピート確率を最大化します。`;
  }
  return `ご相談ありがとうございます！\nその件につきましては、当館のミッション「猫との出会いと、ぬる湯の癒しで、心身をリセットする場を提供する」を踏まえつつ、集客・サービス・CRM・データ分析の各専門AIと連携して最適な回答や改善アクションを提案いたします。\n\n具体的なキーワード（「清掃」「ぬる湯」「猫」「ヴィーガン」「集客」など）を含めて質問していただくと、より詳細なコンサル資料に基づく対策をお答えできます。`;
}
// 11. 各エージェント（相関図ノード）の表示制御
function setAgentDeptState(deptId, state) {
  const node = document.getElementById(`dept-node-${deptId}`);
  if (!node) return;
  // pending, active-thinking, completed
  node.className = `agent-dept-node ${state}`;
  const statusIcon = node.querySelector(".dept-status");
  if (statusIcon) {
    if (state === "pending") statusIcon.innerText = "⚪";
    else if (state === "active-thinking") statusIcon.innerText = "⏳";
    else if (state === "completed") statusIcon.innerText = "✅";
  }
}
function resetAllAgentDepts() {
  const depts = ["mvv", "mkt", "srv", "crm", "ana"];
  depts.forEach(d => setAgentDeptState(d, "pending"));
  const coo = document.getElementById("agent-node-coo");
  if (coo) coo.className = "agent-node node-coo";
}
// 既存のユーティリティ関数
function copyText(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      el.select();
      navigator.clipboard.writeText(el.value);
    } else {
      navigator.clipboard.writeText(el.innerText);
    }
    alert("コピーしました！");
  }
}
// 画像アセット定義
const imageAssets = {
  cat: "file:///C:/Users/user/.gemini/antigravity/brain/1a948177-ec44-4161-b2c9-5f8e3bba9581/onsen_cat_1779748509090.png",
  food: "file:///C:/Users/user/.gemini/antigravity/brain/1a948177-ec44-4161-b2c9-5f8e3bba9581/onsen_food_1779748533916.png",
  view: "file:///C:/Users/user/.gemini/antigravity/brain/1a948177-ec44-4161-b2c9-5f8e3bba9581/onsen_view_1779748552676.png"
};