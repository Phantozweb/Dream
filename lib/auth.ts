// Define user types
export type UserRole = "free" | "beta" | "premium" | "admin"

export interface User {
  email: string
  password: string
  name: string
  role: UserRole
  expiryDate?: string // For trial/subscription expiry
}

// Whitelist of authorized users
export const authorizedUsers: User[] = [
  {
    email: "admin@optometry.edu",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    expiryDate: "2025-12-31",
  },
  {
    email: "premium@optometry.edu",
    password: "premium123",
    name: "Premium User",
    role: "premium",
    expiryDate: "2025-12-31",
  },
  {
    email: "beta@optometry.edu",
    password: "beta123",
    name: "Beta Tester",
    role: "beta",
    expiryDate: "2025-06-30",
  },
  {
    email: "student@optometry.edu",
    password: "student123",
    name: "Student User",
    role: "free",
  },
]

// Authentication functions
export function authenticateUser(email: string, password: string): User | null {
  const user = authorizedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
  return user || null
}

// Check if user has access to AI features
export function hasAIAccess(user: User | null): boolean {
  if (!user) return false
  return user.role === "premium" || user.role === "beta" || user.role === "admin"
}

// Get role description
export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Administrator"
    case "premium":
      return "Premium Member"
    case "beta":
      return "Beta Tester"
    case "free":
      return "Free User"
    default:
      return "Unknown"
  }
}

// Get current user from localStorage
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const userJson = localStorage.getItem("focus_ai_user")
  if (!userJson) return null

  try {
    return JSON.parse(userJson) as User
  } catch (e) {
    return null
  }
}

// Set current user to localStorage
export function setCurrentUser(user: User | null): void {
  if (typeof window === "undefined") return

  if (user) {
    localStorage.setItem("focus_ai_user", JSON.stringify(user))
  } else {
    localStorage.removeItem("focus_ai_user")
  }
}

// Sample data for non-authorized users
export const sampleData = {
  notes: `# Diabetic Retinopathy

## Overview
Diabetic retinopathy is a diabetes complication that affects the eyes. It's caused by damage to the blood vessels in the retina.

## Key Concepts
- Progressive condition that develops in stages
- Classified as non-proliferative or proliferative
- Macular edema can occur at any stage

## Clinical Relevance
- Leading cause of blindness in working-age adults
- Regular screening is essential for early detection
- Tight glycemic control can slow progression

## Diagnostic Approach
- Dilated fundus examination
- Optical Coherence Tomography (OCT)
- Fluorescein angiography for advanced cases

## Management
- Blood sugar and blood pressure control
- Laser photocoagulation
- Anti-VEGF injections for macular edema
- Vitrectomy for advanced cases`,

  caseStudy: `# Case Study: Diabetic Retinopathy

## Patient Information
R. Kumar, a 52-year-old male software engineer from Chennai, Tamil Nadu, presented with complaints of gradually decreasing vision in both eyes over the past 6 months.

## Chief Complaint
- Gradual, painless vision loss
- Occasional floating spots in vision
- Difficulty reading small text

## Ocular Examination
### Visual Acuity
| Eye | Uncorrected | Best Corrected |
|-----|-------------|---------------|
| OD  | 6/24        | 6/12          |
| OS  | 6/36        | 6/18          |

### Refraction
| Eye | Sphere | Cylinder | Axis | Add  |
|-----|--------|----------|------|------|
| OD  | +1.00  | -0.75    | 90   | +2.00|
| OS  | +1.25  | -0.50    | 85   | +2.00|

### Anterior Segment
- Unremarkable in both eyes
- Clear cornea, quiet anterior chamber
- Early nuclear sclerosis in both lenses

### Posterior Segment
- Multiple dot and blot hemorrhages in all quadrants
- Hard exudates in macular region
- Venous beading in inferior temporal arcade
- Macular edema in both eyes

### Additional Tests
- OCT: Central macular thickness OD 310μm, OS 375μm
- IOP: 16 mmHg OD, 17 mmHg OS

## Assessment
Moderate non-proliferative diabetic retinopathy with clinically significant macular edema in both eyes.

## Management Plan
1. Anti-VEGF injections for macular edema
2. Referral to endocrinologist for diabetes management
3. Follow-up in 1 month
4. Patient education on importance of glycemic control`,

  quiz: [
    {
      question: "What is the most likely classification of diabetic retinopathy in this patient?",
      options: [
        { id: "A", text: "Mild non-proliferative diabetic retinopathy" },
        { id: "B", text: "Moderate non-proliferative diabetic retinopathy" },
        { id: "C", text: "Severe non-proliferative diabetic retinopathy" },
        { id: "D", text: "Proliferative diabetic retinopathy" },
      ],
      correctAnswer: "B",
      explanation:
        "The presence of multiple microaneurysms, dot/blot hemorrhages, hard exudates, and mild venous beading indicates moderate NPDR. Severe NPDR would require more extensive hemorrhages, venous beading in 2+ quadrants, or IRMA, while PDR would show neovascularization.",
    },
    {
      question: "What OCT finding is most consistent with diabetic macular edema in this patient?",
      options: [
        { id: "A", text: "Epiretinal membrane" },
        { id: "B", text: "Cystoid spaces and increased retinal thickness" },
        { id: "C", text: "Drusen" },
        { id: "D", text: "Vitreomacular traction" },
      ],
      correctAnswer: "B",
      explanation:
        "Cystoid spaces and increased retinal thickness (310μm OD and 375μm OS) are characteristic OCT findings in diabetic macular edema. Normal central retinal thickness is approximately 250μm.",
    },
    {
      question: "What is the first-line treatment for center-involving diabetic macular edema?",
      options: [
        { id: "A", text: "Observation" },
        { id: "B", text: "Focal laser photocoagulation" },
        { id: "C", text: "Intravitreal anti-VEGF injections" },
        { id: "D", text: "Topical NSAIDs" },
      ],
      correctAnswer: "C",
      explanation:
        "Intravitreal anti-VEGF injections are the first-line treatment for center-involving DME based on multiple clinical trials showing superior visual outcomes compared to laser photocoagulation.",
    },
  ],

  chatResponse: `# Diabetic Retinopathy

Diabetic retinopathy is a microvascular complication of diabetes mellitus that affects the retina and is a leading cause of vision loss globally.

## Pathophysiology

The pathogenesis involves several mechanisms:

1. **Hyperglycemia** - Leads to increased sorbitol pathway activity, oxidative stress, and advanced glycation end-products (AGEs)
2. **Pericyte loss** - Early change that weakens capillary walls
3. **Basement membrane thickening** - Alters vascular permeability
4. **Microaneurysm formation** - Earliest clinically detectable lesion
5. **Blood-retinal barrier breakdown** - Results in exudation and macular edema

## Classification

### Non-Proliferative Diabetic Retinopathy (NPDR)
- **Mild**: Microaneurysms only
- **Moderate**: Microaneurysms, intraretinal hemorrhages, hard exudates
- **Severe**: "4-2-1 rule" - severe intraretinal hemorrhages in 4 quadrants, venous beading in 2+ quadrants, or IRMA in 1+ quadrant

### Proliferative Diabetic Retinopathy (PDR)
- Neovascularization of the disc (NVD) or elsewhere (NVE)
- Vitreous hemorrhage
- Tractional retinal detachment

## Clinical Features
- Often asymptomatic in early stages
- Gradual, painless vision loss
- Floaters (if vitreous hemorrhage)
- Sudden vision loss (if vitreous hemorrhage or tractional detachment)

## Diagnosis
- Comprehensive dilated eye examination
- Optical Coherence Tomography (OCT) - for macular edema
- Fluorescein Angiography - for ischemia and neovascularization
- OCT Angiography - newer non-invasive technique

## Management
1. **Systemic control**:
   - Tight glycemic control (HbA1c < 7%)
   - Blood pressure management
   - Lipid control

2. **NPDR**:
   - Observation and regular follow-up
   - Treatment of macular edema if present

3. **PDR**:
   - Panretinal photocoagulation (PRP)
   - Anti-VEGF injections
   - Vitrectomy for non-clearing vitreous hemorrhage or tractional detachment

4. **Diabetic Macular Edema (DME)**:
   - Anti-VEGF injections (first-line)
   - Focal/grid laser photocoagulation
   - Intravitreal steroids

## Screening Recommendations
- Type 1 DM: Annual screening beginning 5 years after diagnosis
- Type 2 DM: Annual screening beginning at diagnosis
- Pregnant women with pre-existing diabetes: each trimester

## Related Questions
1. What is the role of OCT in managing diabetic retinopathy?
2. How does glycemic control affect the progression of diabetic retinopathy?
3. What are the advantages and disadvantages of anti-VEGF therapy versus laser photocoagulation?
4. How should diabetic retinopathy screening be modified during pregnancy?
5. What is the significance of diabetic macular ischemia in visual prognosis?`,
}

