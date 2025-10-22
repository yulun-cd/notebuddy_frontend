import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      "common.loading": "Loading...",
      "common.error": "Error",
      "common.success": "Success",
      "common.retry": "Retry",
      "common.cancel": "Cancel",
      "common.save": "Save",
      "common.edit": "Edit",
      "common.delete": "Delete",
      "common.confirm": "Confirm",
      "common.yes": "Yes",
      "common.no": "No",

      // Auth
      "auth.login": "Login",
      "auth.logout": "Logout",
      "auth.register": "Register",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.confirmPassword": "Confirm Password",
      "auth.forgotPassword": "Forgot Password?",
      "auth.noAccount": "Don't have an account?",
      "auth.haveAccount": "Already have an account?",
      "auth.loginSuccess": "Login successful",
      "auth.logoutSuccess": "Logout successful",
      "auth.registerSuccess": "Registration successful",

      // Profile
      "profile.title": "Profile",
      "profile.personalInfo": "Personal Information",
      "profile.firstName": "First Name",
      "profile.lastName": "Last Name",
      "profile.nickName": "Nickname",
      "profile.language": "Language",
      "profile.gender": "Gender",
      "profile.notSet": "Not set",
      "profile.updateSuccess": "Profile updated successfully",
      "profile.updateError": "Failed to update profile",

      // Settings
      "settings.title": "Settings",
      "settings.appearance": "Appearance",
      "settings.darkMode": "Dark Mode",
      "settings.darkModeEnabled": "Dark mode enabled",
      "settings.darkModeDisabled": "Dark mode disabled",

      // Gender
      "gender.male": "Male",
      "gender.female": "Female",
      "gender.notSet": "Not set",
      "gender.select": "Select gender",

      // Languages
      "language.english": "English",
      "language.chinese": "Chinese",
      "language.select": "Select language",
      "language.detected": "Language detected",

      // Navigation
      "nav.home": "Home",
      "nav.explore": "Explore",
      "nav.profile": "Profile",
      "home.headerTitle": "My Transcripts",
      "home.addButton": "Add",
      "screen.transcript": "Draft",
      "screen.note": "Note",
      "screen.answer": "Answer to Expand Note",
      "screen.createTranscript": "New Transcript",
      "common.back": "Back",

      // Home
      "home.welcome": "Welcome to NoteBuddy",
      "home.createTranscript": "Create Transcript",
      "home.refresh": "Refresh",
      "home.noTranscripts": "No transcripts yet",
      "home.createFirst": "Create your first transcript",
      "home.search": "Search transcripts...",
      "home.sections.today": "Today",
      "home.sections.thisWeek": "This Week",
      "home.sections.thisMonth": "This Month",
      "home.sections.older": "Older",
      "home.lastEdited": "Last edited",
      "home.draft": "Draft",
      "home.order.desc": "Newest First",
      "home.order.asc": "Oldest First",
      "home.filter.all": "All",
      "home.filter.hasNote": "Has Note",
      "home.filter.noNote": "No Note",

      // Transcript
      "transcript.fillRequired": "Please fill in both title and content",
      "transcript.create": "Create Transcript",
      "transcript.createSuccess": "Transcript created successfully!",
      "transcript.createError": "Failed to create transcript",
      "transcript.creating": "Creating...",
      "transcript.createDescription":
        "Add a new transcript with title and content",
      "transcript.title": "Title",
      "transcript.content": "Content",
      "transcript.titlePlaceholder": "Enter transcript title",
      "transcript.contentPlaceholder": "Enter transcript content...",
      "transcript.loadError": "Failed to load transcript",
      "transcript.updateError": "Failed to update transcript",
      "transcript.overwriteNote": "Overwrite Existing Note",
      "transcript.overwriteMessage":
        "This transcript already has a note. Generating a new note will overwrite the existing one. Do you want to continue?",
      "transcript.overwrite": "Overwrite",
      "transcript.generateNoteError": "Failed to generate note",
      "transcript.notFound": "Transcript not found",
      "transcript.notExist":
        "The transcript you are looking for does not exist.",
      "transcript.created": "Created",
      "transcript.unsavedChanges": "Unsaved changes",
      "transcript.saving": "Saving...",
      "transcript.saveChanges": "Save Changes",
      "transcript.generateNote": "Generate Note",

      // Note
      "note.viewTranscript": "View Original Transcript",
      "note.updateError": "Failed to update note",
      "note.generateQuestionsError": "Failed to generate questions",
      "note.questionsGenerated": "Questions Generated",
      "note.questionsGeneratedMessage":
        "New questions have been generated. Scroll to the bottom to view them.",
      "note.noTranscript": "No transcript found for this note",
      "note.notFound": "Note not found",
      "note.loadError": "There was a problem loading this note.",
      "note.notExist": "The note you are looking for does not exist.",
      "note.titlePlaceholder": "Enter note title",
      "note.created": "Created",
      "note.unsavedChanges": "Unsaved changes",
      "note.saving": "Saving...",
      "note.content": "Content",
      "note.contentPlaceholder": "Enter note content",
      "note.generatedQuestions": "Generated Questions",
      "note.saveChanges": "Save Changes",
      "note.generateQuestions": "Generate Questions",

      // Answer
      "answer.provideAnswer": "Please provide an answer before submitting.",
      "answer.submitSuccess": "Your answer has been submitted successfully!",
      "answer.submitError": "Failed to submit answer",
      "answer.question": "Question",
      "answer.yourAnswer": "Your Answer",
      "answer.placeholder": "Enter your answer here...",
      "answer.submit": "Submit Answer",

      // Voice
      "voice.recognitionError": "Speech Recognition Error",
      "voice.listening": "Listening...",
      "voice.tapToSpeak": "Tap to speak",
      "voice.recordingInProgress": "Recording in progress",

      // Errors
      "error.network": "Network error",
      "error.unauthorized": "Please login to continue",
      "error.server": "Server error",
      "error.unknown": "Unknown error",

      // Validation
      "validation.required": "This field is required",
      "validation.email": "Please enter a valid email",
      "validation.passwordLength": "Password must be at least 6 characters",
      "validation.passwordsMatch": "Passwords do not match",

      // Alerts
      "alert.confirmLogout": "Confirm Logout",
      "alert.logoutMessage": "Are you sure you want to logout?",
      "alert.confirmDelete": "Confirm Delete",
      "alert.deleteMessage": "Are you sure you want to delete this?",
      "alert.confirmDiscard": "Discard Changes",
      "alert.discardMessage":
        "Are you sure you want to discard this transcript?",
      "alert.unsavedChanges": "Unsaved Changes",

      // Common
      "common.dontLeave": "Don't leave",
      "common.discard": "Discard",
      "common.keepEditing": "Keep Editing",
      "common.ok": "OK",
    },
  },
  zh: {
    translation: {
      // Common
      "common.loading": "加载中...",
      "common.error": "错误",
      "common.success": "成功",
      "common.retry": "重试",
      "common.cancel": "取消",
      "common.save": "保存",
      "common.edit": "编辑",
      "common.delete": "删除",
      "common.confirm": "确认",
      "common.yes": "是",
      "common.no": "否",

      // Auth
      "auth.login": "登录",
      "auth.logout": "退出登录",
      "auth.register": "注册",
      "auth.email": "邮箱",
      "auth.password": "密码",
      "auth.confirmPassword": "确认密码",
      "auth.forgotPassword": "忘记密码？",
      "auth.noAccount": "没有账户？",
      "auth.haveAccount": "已有账户？",
      "auth.loginSuccess": "登录成功",
      "auth.logoutSuccess": "退出登录成功",
      "auth.registerSuccess": "注册成功",

      // Profile
      "profile.title": "个人资料",
      "profile.personalInfo": "个人信息",
      "profile.firstName": "名字",
      "profile.lastName": "姓氏",
      "profile.nickName": "昵称",
      "profile.language": "语言",
      "profile.gender": "性别",
      "profile.notSet": "未设置",
      "profile.updateSuccess": "个人资料已更新",
      "profile.updateError": "更新个人资料失败",

      // Settings
      "settings.title": "设置",
      "settings.appearance": "外观",
      "settings.darkMode": "深色模式",
      "settings.darkModeEnabled": "深色模式已启用",
      "settings.darkModeDisabled": "深色模式已禁用",

      // Gender
      "gender.male": "男",
      "gender.female": "女",
      "gender.notSet": "未设置",
      "gender.select": "请选择性别",

      // Languages
      "language.english": "English",
      "language.chinese": "中文",
      "language.select": "请选择语言",
      "language.detected": "检测到语言",

      // Navigation
      "nav.home": "首页",
      "nav.explore": "探索",
      "nav.profile": "个人资料",
      "home.headerTitle": "我的语记",
      "home.addButton": "添加",
      "screen.transcript": "草稿",
      "screen.note": "笔记",
      "screen.answer": "回答以扩充笔记",
      "screen.createTranscript": "新建语记",
      "common.back": "返回",

      // Home
      "home.welcome": "欢迎使用 语记",
      "home.createTranscript": "创建语记",
      "home.refresh": "刷新",
      "home.noTranscripts": "暂无语记",
      "home.createFirst": "创建您的第一个语记",
      "home.search": "搜索语记...",
      "home.sections.today": "今天",
      "home.sections.thisWeek": "本周",
      "home.sections.thisMonth": "本月",
      "home.sections.older": "更早",
      "home.lastEdited": "最后编辑",
      "home.draft": "草稿",
      "home.order.desc": "最新优先",
      "home.order.asc": "最早优先",
      "home.filter.all": "全部",
      "home.filter.hasNote": "有笔记",
      "home.filter.noNote": "无笔记",

      // Transcript
      "transcript.fillRequired": "请填写标题和内容",
      "transcript.create": "创建语记",
      "transcript.createSuccess": "语记创建成功！",
      "transcript.createError": "创建语记失败",
      "transcript.creating": "创建中...",
      "transcript.createDescription": "添加包含标题和内容的新语记",
      "transcript.title": "标题",
      "transcript.content": "内容",
      "transcript.titlePlaceholder": "输入语记标题",
      "transcript.contentPlaceholder": "输入语记内容...",
      "transcript.loadError": "加载语记失败",
      "transcript.updateError": "更新语记失败",
      "transcript.overwriteNote": "覆盖现有笔记",
      "transcript.overwriteMessage":
        "此语记已有笔记。生成新笔记将覆盖现有笔记。是否继续？",
      "transcript.overwrite": "覆盖",
      "transcript.generateNoteError": "生成笔记失败",
      "transcript.notFound": "语记未找到",
      "transcript.notExist": "您查找的语记不存在。",
      "transcript.created": "创建于",
      "transcript.unsavedChanges": "未保存的更改",
      "transcript.saving": "保存中...",
      "transcript.saveChanges": "保存更改",
      "transcript.generateNote": "生成笔记",

      // Note
      "note.viewTranscript": "查看草稿",
      "note.updateError": "更新笔记失败",
      "note.generateQuestionsError": "生成问题失败",
      "note.questionsGenerated": "问题已生成",
      "note.questionsGeneratedMessage": "已生成新问题。滚动到底部查看。",
      "note.noTranscript": "未找到此笔记的语记",
      "note.notFound": "笔记未找到",
      "note.loadError": "加载此笔记时出现问题。",
      "note.notExist": "您查找的笔记不存在。",
      "note.titlePlaceholder": "输入笔记标题",
      "note.created": "创建于",
      "note.unsavedChanges": "未保存的更改",
      "note.saving": "保存中...",
      "note.content": "内容",
      "note.contentPlaceholder": "输入笔记内容",
      "note.generatedQuestions": "生成的问题",
      "note.saveChanges": "保存更改",
      "note.generateQuestions": "生成问题",

      // Answer
      "answer.provideAnswer": "请在提交前提供答案。",
      "answer.submitSuccess": "您的答案已成功提交！",
      "answer.submitError": "提交答案失败",
      "answer.question": "问题",
      "answer.yourAnswer": "您的答案",
      "answer.placeholder": "在此输入您的答案...",
      "answer.submit": "提交答案",

      // Voice
      "voice.recognitionError": "语音识别错误",
      "voice.listening": "正在聆听...",
      "voice.tapToSpeak": "点击说话",
      "voice.recordingInProgress": "录音进行中",

      // Errors
      "error.network": "网络错误",
      "error.unauthorized": "请登录以继续",
      "error.server": "服务器错误",
      "error.unknown": "未知错误",

      // Validation
      "validation.required": "此字段为必填项",
      "validation.email": "请输入有效的邮箱地址",
      "validation.passwordLength": "密码至少需要6个字符",
      "validation.passwordsMatch": "密码不匹配",

      // Alerts
      "alert.confirmLogout": "确认退出登录",
      "alert.logoutMessage": "确定要退出登录吗？",
      "alert.confirmDelete": "确认删除",
      "alert.deleteMessage": "确定要删除此项吗？",
      "alert.confirmDiscard": "放弃更改",
      "alert.discardMessage": "确定要放弃此语记吗？",
      "alert.unsavedChanges": "未保存的更改",

      // Common
      "common.dontLeave": "不离开",
      "common.discard": "放弃",
      "common.keepEditing": "继续编辑",
      "common.ok": "确定",
    },
  },
};

// Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: "en", // Default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already safes from xss
  },
});

export default i18n;
