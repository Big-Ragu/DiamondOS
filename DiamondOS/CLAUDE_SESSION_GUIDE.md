# 🤖 CLAUDE SESSION QUICK START GUIDE

## 🎯 FOR FUTURE CLAUDE SESSIONS

### 📁 **IMMEDIATE SETUP (First 30 seconds of each session):**

1. **Check project location:**
```
Filesystem:directory_tree path="E:\DiamondOS"
```

2. **Read current plan:**
```  
Filesystem:read_file path="E:\DiamondOS\SESSION_PLAN.md"
```

3. **Check what was last completed:**
- Look for completed checkboxes in SESSION_PLAN.md
- Read any recent files to understand current state

---

## 🚀 **SERVER INSTRUCTIONS (USER REQUEST):**

**IMPORTANT:** After each session where you create/update code:
1. **Notify user when code is ready for browser testing**
2. **Tell user to run these commands in E:\DiamondOS:**
   ```bash
   npm install
   npm run dev
   ```
3. **Let them know when server should be ready at http://localhost:3000**

**NOTE:** Claude cannot actually run servers or execute commands - only create/modify files. User must run the commands themselves.

---

## 🎯 **WHAT YOU ARE BUILDING:**

**DiamondOS** = Baseball League Management SaaS Platform

**Converting these HTML prototypes to React/Next.js:**
- Scorekeeping system with dual manager entry
- Commissioner dashboard for league management  
- Public league website with stats/standings
- Live draft system
- Advanced analytics dashboard

**Tech Stack:** Next.js 15 + React 19 + TypeScript + Tailwind + shadcn/ui + Supabase

---

## 🔍 **SESSION EXECUTION PATTERN:**

### **PHASE 1: FOUNDATION (Sessions 1-3)**
- Setting up Next.js project structure
- Installing dependencies and configuring build tools
- Creating database schemas and API foundations

### **PHASE 2: CORE FEATURES (Sessions 4-8)**  
- Converting each HTML file to React components
- Building core baseball league functionality
- Implementing game management and statistics

### **PHASE 3: INTEGRATIONS (Sessions 9-11)**
- Adding authentication, payments, real-time features
- Connecting external APIs and services

### **PHASE 4: PRODUCTION (Sessions 12-15)**
- Mobile optimization, AI features, testing
- Deployment preparation and documentation

---

## ⏱️ **10-15 MINUTE SESSION RULES:**

1. **Focus on ONE clear deliverable per session**
2. **Save ALL work before session ends**
3. **Update progress checkboxes in SESSION_PLAN.md**
4. **Leave clear notes for next session**
5. **NOTIFY USER when code is ready for browser testing**

---

## 🚀 **CURRENT PROJECT STATUS:**

**Location:** `E:\DiamondOS\`
**Next Session:** Check SESSION_PLAN.md for current status
**Backup Location:** `E:\Backups\SESSION_PLAN_BACKUP.md`

---

## 💡 **KEY REMINDERS:**

- **Claude can't remember previous sessions** - always read existing files first
- **Claude can't run servers** - only create/modify files, user must run commands
- **Build incrementally** - each session should add working features
- **Save frequently** - use Filesystem:write_file for all code
- **Update the plan** - mark completed tasks and note any changes
- **Be specific** - each session should have measurable outcomes
- **Always notify user when ready for browser testing**

---

*This guide ensures consistent progress across multiple Claude sessions toward building a production-ready baseball league management platform.*