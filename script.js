// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyCIdTjge1i3eoSH6a4hidB1_-C_iuA7bXk",
  authDomain: "kokecoco-emorun.firebaseapp.com",
  projectId: "kokecoco-emorun",
  storageBucket: "kokecoco-emorun.firebasestorage.app",
  messagingSenderId: "829229228681",
  appId: "1:829229228681:web:fe8592a7f4e00b76d19c58",
  measurementId: "G-3K8MQ3VZV7",
};

// Firebase 初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ローカルストレージでユーザー識別
let userId = localStorage.getItem("userId");
if (!userId) {
  userId = "user_" + Math.random().toString(36).substr(2, 9);
  localStorage.setItem("userId", userId);
}

// 投稿処理
function postColor() {
  const color = document.getElementById("colorInput").value;
  const reason = document.getElementById("reasonInput").value;

  if (!color || !reason) {
    alert("色と理由を入力してください。");
    return;
  }

  const postRef = db.collection("posts").doc(userId);

  postRef
    .set({
      color: color,
      reason: reason,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      deleted: false, // 削除フラグ
    })
    .then(() => {
      console.log("投稿完了");
      loadPosts(); // 再読み込み
    })
    .catch((error) => console.error("エラー:", error));
}

// 投稿リスト取得
function loadPosts() {
  const postsContainer = document.getElementById("postsContainer");
  postsContainer.innerHTML = "";

  db.collection("posts")
    .orderBy("timestamp", "desc")
    .get()
    .then((snapshot) => {
      const batch = db.batch(); // Firestore バッチ処理

      snapshot.forEach((doc) => {
        const data = doc.data();
        const postRef = db.collection("posts").doc(doc.id);

        const now = new Date();
        const postTime = data.timestamp?.toDate();
        const timeDiff = postTime ? (now - postTime) / (1000 * 60 * 60) : 0;

        if (timeDiff >= 24 && !data.deleted) {
          // 24時間経過していたら `deleted: true` に更新
          batch.update(postRef, { deleted: true });
        }

        if (!data.deleted) {
          // 削除フラグが `false` の投稿のみ表示
          const postElement = document.createElement("div");
          postElement.innerHTML = `
              <div style="border: 2px solid ${data.color}; padding: 10px; margin: 5px;">
                <strong>色:</strong> <span style="color:${data.color}">${data.color}</span><br>
                <strong>理由:</strong> ${data.reason}
              </div>`;
          postsContainer.appendChild(postElement);
        }
      });

      return batch.commit(); // 変更を一括適用
    })
    .catch((error) => console.error("データ取得エラー:", error));
}

// 初回ロード時に投稿を読み込む
window.onload = loadPosts;

function updateCharCount() {
  const reasonInput = document.getElementById("reasonInput");
  const charCount = document.getElementById("charCount");
  charCount.textContent = `${reasonInput.value.length} / 30`;
}
