# AI Prompts Guide

Quick reference for using AI tools effectively during your interview.

## 🎯 Context Setup Prompts

### Initial Context

```
I'm working in a pnpm monorepo with:
- Backend: NestJS + TypeScript + Prisma + PostgreSQL (Port 4000)
- Frontend 1: Site Manager - React + Vite + TailwindCSS (Port 3000)
- Frontend 2: Dispatcher - React + Vite + TailwindCSS (Port 3001)
- Shared: TypeScript types package

Structure:
- apps/backend/
- apps/site-manager/
- apps/dispatcher/
- packages/shared/

All code uses TypeScript strict mode and must pass ESLint with zero errors.
```

### Feature Implementation Workflow

```
I need to implement [FEATURE_NAME]. Please:

1. First, define the necessary TypeScript types in packages/shared/src/index.ts
2. Create the Prisma model in apps/backend/prisma/schema.prisma if database storage is needed
3. Implement the NestJS controller and service in apps/backend/src/
4. Add the frontend components in apps/site-manager/src/ and apps/dispatcher/src/

Ensure:
- All types are imported from 'shared' package
- TypeScript strict mode compliance
- ESLint rules are followed
- CORS is configured for both frontend origins
```

## 📝 Common Feature Prompts

### CRUD Operations

```
Create a CRUD API for [ENTITY_NAME] with the following fields:
[LIST_FIELDS]

Requirements:
- Use Prisma ORM with PostgreSQL
- Add proper TypeScript types in shared package
- Include proper validation using class-validator
- Create endpoints: GET (all), GET (by id), POST, PUT, DELETE
- Use UUID for primary keys
- Add timestamps (createdAt, updatedAt)
```

### Frontend Form

```
Create a form in [APP_NAME] to [ACTION]:

Fields:
[LIST_FIELDS_WITH_TYPES]

Requirements:
- Use Tailwind CSS for styling
- Import types from 'shared' package
- Handle loading and error states
- Show success message on completion
- Fetch API at http://localhost:4000/[ENDPOINT]
- Make it responsive
```

### API Integration

```
Connect [FRONTEND_APP] to the backend [ENDPOINT].

Requirements:
- Use fetch API
- Type the response with types from 'shared' package
- Handle loading, success, and error states
- Display data in a [TABLE/CARD/LIST] layout with Tailwind CSS
- Add proper error messages
```

### Database Migration

```
I need to add a new field [FIELD_NAME] of type [TYPE] to the [MODEL_NAME] model.
Update the Prisma schema and show me the migration command.
```

### Validation

```
Add validation to [CONTROLLER_METHOD] using class-validator.

Fields to validate:
[LIST_FIELDS_WITH_RULES]

Return proper error messages with 400 status code for invalid input.
```

## 🔧 Debugging Prompts

### Type Errors

```
I'm getting a TypeScript error: [ERROR_MESSAGE]

In file: [FILE_PATH]

Context: [PASTE_CODE]

Fix the type error while maintaining strict TypeScript compliance.
```

### ESLint Errors

```
Fix these ESLint errors in [FILE_PATH]:
[PASTE_ERRORS]

Maintain code functionality and follow best practices.
```

### API Not Connecting

```
My frontend at [PORT] can't connect to the backend at http://localhost:4000.

Error: [ERROR_MESSAGE]

Check:
- CORS configuration in apps/backend/src/main.ts
- Fetch URL in frontend
- Backend is running
```

## 🚀 Speed Optimization Prompts

### Scaffold Module

```
Scaffold a complete feature module for [FEATURE_NAME]:

Backend (NestJS):
- Module, Controller, Service
- Prisma model with fields: [FIELDS]
- CRUD endpoints
- Proper types

Frontend (both apps):
- List view component
- Create/Edit form
- Type-safe API calls

Shared:
- Interface definitions
- DTOs
```

### Bulk Type Definitions

```
Create TypeScript interfaces in packages/shared/src/index.ts for:

1. [ENTITY_NAME_1] with fields: [FIELDS]
2. [ENTITY_NAME_2] with fields: [FIELDS]
3. [ENTITY_NAME_3] with fields: [FIELDS]

Include Create/Update DTOs for each.
```

## 🎨 Styling Prompts

### Component Styling

```
Style this component using Tailwind CSS:
[PASTE_COMPONENT]

Make it:
- Responsive (mobile-first)
- Match the [APP_NAME] theme (blue/indigo for Site Manager, purple/pink for Dispatcher)
- Include proper spacing and typography
- Add hover states for interactive elements
```

### Consistent Design

```
Create a reusable [COMPONENT_TYPE] component in [APP_NAME] with:
- Tailwind CSS styling matching the app theme
- TypeScript props interface
- Proper accessibility attributes
- Loading and error states
```

## 🧪 Testing Prompts

### Manual Testing Checklist

```
Create a testing checklist for the [FEATURE_NAME] feature covering:
- API endpoint testing (curl commands or fetch examples)
- Frontend functionality in both apps
- Error handling scenarios
- Edge cases
```

### API Testing

```
Give me curl commands to test these endpoints:
[LIST_ENDPOINTS]

Include examples with:
- Valid data
- Invalid data (for validation testing)
- Required headers
```

## 📦 Package Management

### Add Dependency

```
I need to add [PACKAGE_NAME] to [APP_NAME].

Show me:
- The correct pnpm command for a workspace
- How to import and use it
- Any necessary configuration
```

## 🏗️ Architecture Decisions

### Module Organization

```
I'm building a [FEATURE_NAME] feature. Suggest:
- File structure for the backend module
- Where to place frontend components
- How to organize the types in shared package
- Best practices for this use case
```

### State Management

```
For [FEATURE_NAME], should I:
- Use local component state?
- Create a separate api utility file?
- What's the best pattern given our stack?
```

## ⚡ Pro Tips

1. **Be Specific**: Include file paths, error messages, and context
2. **Request Complete Code**: Ask for full implementations, not just snippets
3. **Emphasize Constraints**: Mention TypeScript strict mode, ESLint, and shared types
4. **Batch Requests**: Ask for multiple related changes in one prompt
5. **Verify Types**: Always confirm types are defined in shared package first

## 🎬 Example: Complete Feature Workflow

```
I need to implement a "Fuel Orders" feature:

Step 1 - Define types in packages/shared/src/index.ts:
- FuelOrder interface with: id (string), customerId (string), fuelType (string), quantity (number), status (enum), createdAt (Date)
- CreateFuelOrderDto, UpdateFuelOrderDto
- FuelOrderStatus enum

Step 2 - Create Prisma model in apps/backend/prisma/schema.prisma:
- FuelOrder model matching the interface
- Relations if needed

Step 3 - NestJS backend (apps/backend/src/):
- Create fuel-orders module, controller, service
- Implement CRUD endpoints
- Add validation with class-validator

Step 4 - Site Manager frontend (apps/site-manager/src/):
- Create order form component
- Add order submission logic
- Show user-friendly success/error messages

Step 5 - Dispatcher frontend (apps/dispatcher/src/):
- Create orders list view with table
- Add status update functionality
- Show real-time order stats

Ensure all code:
- Uses types from 'shared' package
- Passes TypeScript strict checks
- Passes ESLint with zero errors
- Follows the existing code style
```

---

**Remember**: The interviewers want to see you use AI effectively. Be deliberate, stay organized, and keep code quality high! 🚀
