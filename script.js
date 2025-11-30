// **المفتاح السري لقاعدة بياناتك المحلية (Local Storage Key)**
const DB_KEY = 'mySmartLocalSiteData';

// **بيانات أولية (تظهر فقط عند تشغيل التطبيق لأول مرة)**
// تأكد أن مسارات الصور (imagePath) صحيحة وموجودة في مجلد images/
const initialPosts = [
    {
        id: 1,
        imagePath: 'images/first_post_image.jpg', // تأكد من وجود هذه الصورة
        caption: "مرحباً بكم في أول منشور لي! أتمنى لكم يوماً سعيداً.",
        likes: 0, // لايكات خاصة بهذا الجهاز
        comments: [] // تعليقات خاصة بهذا الجهاز
    },
    {
        id: 2,
        imagePath: 'images/second_post_image.png', // تأكد من وجود هذه الصورة
        caption: "صورة جديدة لغروب الشمس، ما أجمل المنظر! ✨",
        likes: 0, // لايكات خاصة بهذا الجهاز
        comments: []
    }
];

// -----------------------------------------------------------------
// **دوال التعامل مع Local Storage (قاعدة البيانات المحلية)**
// -----------------------------------------------------------------

/**
 * دالة جلب البيانات من ذاكرة الهاتف (Local Storage).
 * إذا لم توجد بيانات، تحفظ البيانات الأولية.
 * @returns {Array} مصفوفة المنشورات.
 */
function getLocalData() {
    const storedData = localStorage.getItem(DB_KEY);
    if (storedData) {
        return JSON.parse(storedData);
    }
    // إذا لم نجد بيانات، نحفظ البيانات الأولية ونعرضها
    saveLocalData(initialPosts);
    return initialPosts;
}

/**
 * دالة حفظ البيانات الجديدة في ذاكرة الهاتف (Local Storage).
 * @param {Array} posts - مصفوفة المنشورات المحدثة.
 */
function saveLocalData(posts) {
    localStorage.setItem(DB_KEY, JSON.stringify(posts));
}

// -----------------------------------------------------------------
// **دوال التفاعل (لايك وتعليق وإضافة منشور)**
// -----------------------------------------------------------------

function toggleLike(postId) {
    const posts = getLocalData();
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex !== -1) {
        posts[postIndex].likes += 1; // زيادة اللايك
        saveLocalData(posts); // الحفظ الدائم في الهاتف
        renderPosts(); // تحديث العرض
    }
}

function addComment(postId, commentText) {
    const posts = getLocalData();
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex !== -1 && commentText.trim() !== "") {
        const newComment = {
            user: "أنا (المستخدم المحلي)", // يمكنك تعديل هذا الاسم مستقبلاً
            text: commentText
        };
        posts[postIndex].comments.push(newComment);
        saveLocalData(posts); // الحفظ الدائم في الهاتف
        renderPosts(); // تحديث العرض
    }
}

function addNewPost() {
    const imagePath = document.getElementById('new-image-path').value.trim();
    const caption = document.getElementById('new-caption').value.trim();

    if (!imagePath || !caption) {
        alert("الرجاء إدخال مسار الصورة والوصف.");
        return;
    }

    const posts = getLocalData();
    const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;

    const newPost = {
        id: newId,
        imagePath: imagePath,
        caption: caption,
        likes: 0,
        comments: []
    };

    posts.push(newPost);
    saveLocalData(posts);
    renderPosts();

    // إخفاء النموذج ومسح الحقول
    hideAddPostForm();
    document.getElementById('new-image-path').value = '';
    document.getElementById('new-caption').value = '';
}


// -----------------------------------------------------------------
// **دوال المشاركة والتشفير (للتواصل اليدوي)**
// -----------------------------------------------------------------

/**
 * دالة لتشفير البيانات الحالية في Local Storage وتحويلها لرابط قابل للمشاركة.
 */
function createShareableLink() {
    const posts = getLocalData();
    const dataString = JSON.stringify(posts);
    const encodedData = btoa(dataString); // تشفير Base64

    // بناء الرابط
    const shareLink = window.location.origin + window.location.pathname + '?data=' + encodedData;
    
    // عرض الرابط للمستخدم لنسخه
    alert('🔗 انسخ هذا الرابط لمشاركة تفاعلاتك مع الآخرين:\n' + shareLink + '\n\n(عند فتح الرابط، سيتم تحديث بياناتهم.)');
}

/**
 * دالة لقراءة البيانات من الرابط (عندما يفتح شخص آخر الرابط الذي تم مشاركته).
 */
function loadDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');

    if (encodedData) {
        try {
            const dataString = atob(encodedData); // فك تشفير Base64
            const sharedPosts = JSON.parse(dataString);
            
            // حفظ البيانات المشتركة في Local Storage الخاص بالمستخدم الحالي
            saveLocalData(sharedPosts);
            
            alert('🎉 تم تحميل بيانات اللايكات والتعليقات المشتركة بنجاح!');
            // مسح معلمة البيانات من الرابط بعد التحميل لتجنب تكرار التحميل
            // هذا يجعل الرابط نظيفاً بعد الاستخدام الأول
            window.history.replaceState({}, document.title, window.location.pathname); 

        } catch (e) {
            console.error("❌ خطأ في قراءة البيانات المشتركة من الرابط:", e);
            alert("⚠️ حدث خطأ أثناء تحميل البيانات المشتركة من الرابط.");
        }
    }
}

// -----------------------------------------------------------------
// **دوال عرض وإخفاء النماذج**
// -----------------------------------------------------------------

function showAddPostForm() {
    document.getElementById('add-post-form').style.display = 'block';
}

function hideAddPostForm() {
    document.getElementById('add-post-form').style.display = 'none';
}


// -----------------------------------------------------------------
// **دالة عرض المنشورات على الصفحة (Render)**
// -----------------------------------------------------------------

function renderPosts() {
    const posts = getLocalData();
    const container = document.getElementById('posts-container');
    container.innerHTML = ''; // مسح المحتوى القديم

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';

        // الصورة والوصف واللايكات
        postElement.innerHTML = `
            <img src="${post.imagePath}" alt="${post.caption}">
            <p class="caption">${post.caption}</p>
            <p><strong>الإعجابات: ${post.likes}</strong></p>
        `;

        // زر الإعجاب
        const likeButton = document.createElement('button');
        likeButton.className = 'like-button';
        likeButton.textContent = `أعجبني (${post.likes})`;
        likeButton.onclick = () => toggleLike(post.id);
        postElement.appendChild(likeButton);

        // عرض التعليقات
        const commentsList = document.createElement('ul');
        commentsList.className = 'comment-list';
        if (post.comments.length === 0) {
            const li = document.createElement('li');
            li.textContent = "لا توجد تعليقات بعد. كن أول من يعلق!";
            commentsList.appendChild(li);
        } else {
            post.comments.forEach(comment => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${comment.user}</strong>: ${comment.text}`;
                commentsList.appendChild(li);
            });
        }
        postElement.appendChild(commentsList);

        // نموذج إضافة تعليق
        const commentArea = document.createElement('div');
        commentArea.innerHTML = `
            <input type="text" id="comment-input-${post.id}" class="comment-input" placeholder="اكتب تعليقك...">
            <button class="comment-button" onclick="handleCommentSubmission(${post.id})">إرسال</button>
        `;
        postElement.appendChild(commentArea);

        container.appendChild(postElement);
    });
}

// دالة مساعدة لجلب النص من حقل الإدخال وإرساله لدالة addComment
function handleCommentSubmission(postId) {
    const inputElement = document.getElementById(`comment-input-${postId}`);
    const commentText = inputElement.value;
    addComment(postId, commentText);
    inputElement.value = ''; // مسح النص بعد الإرسال
}


// -----------------------------------------------------------------
// **نقطة البداية لتشغيل التطبيق:**
// 1. محاولة تحميل البيانات من الرابط (إذا كان موجوداً).
// 2. ثم عرض المنشورات المخزنة محلياً أو الأولية.
// -----------------------------------------------------------------
loadDataFromURL(); // تحميل البيانات المشتركة إن وجدت
renderPosts();     // عرض المنشورات