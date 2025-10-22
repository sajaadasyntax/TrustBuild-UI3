# Admin UI/UX Access Guide

This guide shows exactly what each admin role sees in the frontend interface.

---

## 🎯 SUPPORT_ADMIN Interface

### Top Navigation Bar
```
┌─────────────────────────────────────────────────────────────────────┐
│ 🛡️ TrustBuild Admin                                         [Avatar] │
│                                                                       │
│ Dashboard | Users | Contractors | Jobs | Reviews | Content           │
└─────────────────────────────────────────────────────────────────────┘
```

### Dashboard View
```
┌──────────────────────────────────────────────────────────────────────┐
│                         Admin Dashboard                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────┐  ┌───────────────────┐  ┌──────────────────┐ │
│  │ 👥 User           │  │ 🏢 Contractor     │  │ ✅ KYC Review    │ │
│  │    Management     │  │    Management     │  │                  │ │
│  │                   │  │                   │  │  View & request  │ │
│  │ [Manage Users]    │  │ [Manage Contr.]   │  │  [Review KYC]    │ │
│  └───────────────────┘  └───────────────────┘  └──────────────────┘ │
│                                                                       │
│  ┌───────────────────┐  ┌───────────────────┐  ┌──────────────────┐ │
│  │ 📄 Job Oversight  │  │ ⭐ Review         │  │ 📁 Content       │ │
│  │                   │  │    Management     │  │    Moderation    │ │
│  │ Set lead prices ✅│  │                   │  │                  │ │
│  │ [View Jobs]       │  │ [Moderate Reviews]│  │ [Manage Content] │ │
│  └───────────────────┘  └───────────────────┘  └──────────────────┘ │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### What SUPPORT_ADMIN Can Do:
- ✅ Edit user accounts and resolve account issues
- ✅ Edit contractor profiles and provide support
- ✅ View KYC submissions and request updates
- ✅ **Set job lead prices** (pricing:write)
- ✅ Manage jobs, flag issues, resolve disputes
- ✅ Moderate reviews (approve/reject)
- ✅ Manage FAQs and featured contractors
- ✅ Handle flagged content

### What SUPPORT_ADMIN CANNOT Do:
- ❌ Approve contractor applications
- ❌ Approve KYC submissions
- ❌ Access Payment Dashboard
- ❌ Process refunds
- ❌ Access Platform Settings
- ❌ View invoices or financial data
- ❌ Override final price confirmations

---

## 💰 FINANCE_ADMIN Interface

### Top Navigation Bar
```
┌─────────────────────────────────────────────────────────────────────┐
│ 🛡️ TrustBuild Admin                                         [Avatar] │
│                                                                       │
│ Dashboard | Users | Contractors | Jobs | Payments | Settings         │
└─────────────────────────────────────────────────────────────────────┘
```

### Dashboard View
```
┌──────────────────────────────────────────────────────────────────────┐
│                         Admin Dashboard                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────┐  ┌───────────────────┐  ┌──────────────────┐ │
│  │ 👥 User           │  │ 🏢 Contractor     │  │ 📄 Job Oversight │ │
│  │    Management     │  │    Management     │  │                  │ │
│  │                   │  │                   │  │  Set lead prices │ │
│  │ [Manage Users]    │  │ [Approve ✅]      │  │  [View Jobs]     │ │
│  └───────────────────┘  └───────────────────┘  └──────────────────┘ │
│                                                                       │
│  ┌───────────────────┐  ┌───────────────────┐                        │
│  │ 💳 Payment        │  │ ⚙️ Platform       │                        │
│  │    Dashboard      │  │    Settings       │                        │
│  │                   │  │                   │                        │
│  │ [View Payments]   │  │ [Manage Settings] │                        │
│  │ [Refunds ✅]      │  │ [Pricing Config]  │                        │
│  └───────────────────┘  └───────────────────┘                        │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### What FINANCE_ADMIN Can Do:
- ✅ Edit user accounts
- ✅ Edit contractor profiles
- ✅ **Approve contractor applications** (contractors:approve)
- ✅ **Approve KYC submissions** (kyc:approve)
- ✅ Set job lead prices
- ✅ View all payments and transactions
- ✅ **Process refunds** (payments:refund)
- ✅ Manage invoices and subscriptions
- ✅ Configure platform settings
- ✅ **Override final price confirmations** (final_price:write)
- ✅ Set service pricing

### What FINANCE_ADMIN CANNOT Do:
- ❌ Moderate reviews
- ❌ Manage content (FAQs, featured contractors)
- ❌ Handle flagged content
- ❌ Access security logs

---

## 🔐 SUPER_ADMIN Interface

### Top Navigation Bar
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🛡️ TrustBuild Admin                                                 [Avatar] │
│                                                                               │
│ Dashboard | Users | Contractors | Jobs | Reviews | Content | Payments | ... │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Dashboard View
```
┌──────────────────────────────────────────────────────────────────────┐
│                         Admin Dashboard                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  [ALL CARDS FROM BOTH SUPPORT_ADMIN AND FINANCE_ADMIN]               │
│                                                                       │
│  PLUS:                                                                │
│  ┌───────────────────┐                                               │
│  │ 🔒 Security &     │                                               │
│  │    Logs           │                                               │
│  │                   │                                               │
│  │ [View Logs]       │                                               │
│  │ [Admin Mgmt]      │                                               │
│  └───────────────────┘                                               │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### What SUPER_ADMIN Can Do:
- ✅ **Everything** that SUPPORT_ADMIN can do
- ✅ **Everything** that FINANCE_ADMIN can do
- ✅ Access security logs
- ✅ Create and manage admin accounts
- ✅ Configure all system settings
- ✅ Override any restriction

---

## 🚀 Quick Visual Comparison

### Navigation Access

| Section | SUPPORT | FINANCE | SUPER |
|---------|---------|---------|-------|
| Dashboard | ✅ | ✅ | ✅ |
| Users | ✅ | ✅ | ✅ |
| Contractors | ✅ | ✅ | ✅ |
| Jobs | ✅ | ✅ | ✅ |
| **Reviews** | ✅ | ❌ | ✅ |
| **Content** | ✅ | ❌ | ✅ |
| **Payments** | ❌ | ✅ | ✅ |
| **Settings** | ❌ | ✅ | ✅ |

### Dashboard Cards

| Card | SUPPORT | FINANCE | SUPER |
|------|---------|---------|-------|
| User Management | ✅ | ✅ | ✅ |
| Contractor Management | ✅ | ✅ | ✅ |
| KYC Review | ✅ | ✅ | ✅ |
| Job Oversight | ✅ | ✅ | ✅ |
| **Review Management** | ✅ | ❌ | ✅ |
| **Content Moderation** | ✅ | ❌ | ✅ |
| **Payment Dashboard** | ❌ | ✅ | ✅ |
| **Platform Settings** | ❌ | ✅ | ✅ |
| **Security & Logs** | ❌ | ❌ | ✅ |

---

## 📱 User Profile Dropdown

All admin roles see their profile in the top-right corner:

### SUPPORT_ADMIN Dropdown:
```
┌──────────────────────────┐
│ Support Administrator    │
│ support@trustbuild.uk    │
│ Role: SUPPORT_ADMIN      │
├──────────────────────────┤
│ [Log out]                │
└──────────────────────────┘
```

### FINANCE_ADMIN Dropdown:
```
┌──────────────────────────┐
│ Finance Administrator    │
│ finance@trustbuild.uk    │
│ Role: FINANCE_ADMIN      │
├──────────────────────────┤
│ ⚙️ Settings               │
├──────────────────────────┤
│ [Log out]                │
└──────────────────────────┘
```
*(Settings option only appears for FINANCE_ADMIN and SUPER_ADMIN)*

---

## 🔧 Implementation Details

### Frontend Files Modified:
1. **`project/components/layout/admin-navigation.tsx`**
   - Navigation items now filtered by permissions
   - Settings dropdown item conditionally rendered

2. **`project/app/admin/page.tsx`**
   - Dashboard cards split by role
   - Payment and Content cards separated
   - Permission checks on each card

### Permission Checking Logic:
```typescript
// Check if admin has any of the required permissions
function hasAnyPermission(
  userPermissions: string[] | null | undefined, 
  required: string[]
): boolean {
  if (!userPermissions) return false
  return required.some(perm => userPermissions.includes(perm))
}

// Usage in components:
{(isSuperAdmin || hasAnyPermission(permissions, ['content:read', 'content:write'])) && (
  <Card>Content Moderation Card</Card>
)}
```

---

## ✅ Testing Checklist

### After Deployment, Verify:

#### As SUPPORT_ADMIN:
- [ ] Navigation shows: Dashboard, Users, Contractors, Jobs, Reviews, Content
- [ ] Dashboard shows 6 cards (User, Contractor, KYC, Job, Review, Content)
- [ ] Can update job lead prices without 403 error
- [ ] Cannot see Payments or Settings in navigation
- [ ] Settings option NOT in profile dropdown

#### As FINANCE_ADMIN:
- [ ] Navigation shows: Dashboard, Users, Contractors, Jobs, Payments, Settings
- [ ] Dashboard shows 5 cards (User, Contractor, Job, Payment, Settings)
- [ ] Can approve contractors
- [ ] Can approve KYC
- [ ] Can process refunds
- [ ] Cannot see Reviews or Content in navigation
- [ ] Settings option appears in profile dropdown

#### As SUPER_ADMIN:
- [ ] Navigation shows all sections
- [ ] Dashboard shows all cards including Security & Logs
- [ ] All actions work without restrictions

---

## 🎨 Visual Design Notes

### Color Coding (Optional Enhancement):
You could add visual indicators to help distinguish roles:

```typescript
// In admin navigation
const roleColors = {
  SUPPORT_ADMIN: 'text-blue-600',
  FINANCE_ADMIN: 'text-green-600',
  SUPER_ADMIN: 'text-purple-600',
}
```

### Badge Indicators:
Add role badges to the profile dropdown:
```tsx
<Badge variant={admin.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>
  {admin.role}
</Badge>
```

---

*Last Updated: October 22, 2024*

