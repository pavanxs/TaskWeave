Ran tool

Okay, here is the Product Requirements Document (PRD) for your NODIT MCP-like automation platform prototype, tailored for a visual-first hackathon demonstration.

---

## Product Requirements Document (PRD)

**Project Name:** NODIT Flow - Visual Automation Prototype

**Version:** 1.0
**Date:** October 26, 2023
**Author:** AI Project Team (Product Designer, Product Manager, Developer)

---

### 1. Project Overview & Core Goal

**1.1. Project Vision:**
To develop a compelling, visually intuitive, and engaging front-end prototype of an automation platform, similar to Zapier or Make.com, that clearly demonstrates the concept of building workflows using NODIT MCP integrations. The primary focus is on showcasing the user experience and interface design rather than full backend functionality.

**1.2. Core Goal for Hackathon:**
To present a highly polished and understandable visual demonstration of how users would interact with and build automation workflows. The success metric is the clarity and impressiveness of the visual prototype, allowing observers to grasp the product's potential even without a working backend.

---

### 2. Key Features (Visual Focus)

The following features will be visually represented and interactive on the frontend, with backend functionality to be mocked or conceptual for the hackathon:

**2.1. Visual Workflow Builder:**
*   A central canvas area where users can drag, drop, and connect various automation "blocks" to form a workflow.
*   Connections between blocks will visually represent data flow or sequence of operations.
*   Leverages the **React Flow library** for core interaction.

**2.2. Service/Action Block Library (Left Panel):**
*   A dedicated, scrollable panel on the left side of the canvas.
*   Visually displays a categorized list of available triggers and actions (e.g., "NODIT MCP Action," "HTTP Request," "Delay," "Conditional Logic," "Email Send").
*   Each block will have a distinct icon and a clear, concise name.
*   Blocks will be **draggable** from this panel onto the main workflow canvas.

**2.3. Configurable Block Properties Panel (Right Panel/Modal):**
*   A dynamic panel that appears on the right side (or as a modal, but a right-side panel is preferred for persistent context) when a block on the workflow canvas is selected.
*   Displays properties and configuration options relevant to the selected block type.
*   **Examples of visual elements:**
    *   **Common:** Block Name, Description.
    *   **NODIT MCP Action Block:** Placeholder input fields for `API Key`, `Action Name`, `Parameters` (e.g., key-value pairs, text areas for JSON), `Authentication Type` dropdown.
    *   **Conditional Block:** Dropdowns for `Operator` (e.g., "equals," "contains"), input fields for `Value A`, `Value B`.
*   Includes a visual "Save" or "Apply" button (which will trigger a UI update but no backend action in the prototype).

---

### 3. User Personas/Types (Conceptual for Prototype)

For the purpose of this visual prototype, we will consider the primary user to be:

**3.1. "The Aspiring Automator":**
*   **Needs:** To understand how visual automation works, to see the potential for connecting different services, and to visualize complex logic simply.
*   **Goals:** To quickly grasp the platform's capabilities and envision how it could streamline their tasks, even without diving into code.
*   **Visual Interaction Focus:** Needs clear visual cues, intuitive drag-and-drop, and immediate feedback on interactions.

---

### 4. User Flows (Visual Demonstration)

The prototype will visually demonstrate the following key user flow:

**4.1. Creating a New Automation Workflow:**
1.  **Start:** User lands on the main Project Canvas Page (`/project`).
2.  **Add Trigger:** User drags a "Trigger" block (e.g., "Webhook Listener," "NODIT MCP Event") from the Left Panel onto the Middle Workflow Canvas.
3.  **Configure Trigger:** User clicks on the placed Trigger block, causing the Right Panel to open and display its configuration fields. User visually "fills in" (by seeing input fields, not actual data entry) mock details like webhook URL or event type. User clicks "Save."
4.  **Add Action:** User drags an "Action" block (e.g., "NODIT MCP Action," "Send Email," "Delay") from the Left Panel onto the Middle Workflow Canvas.
5.  **Connect Blocks:** User draws a connection (edge) from the Trigger block to the Action block on the canvas using React Flow's handles.
6.  **Configure Action:** User clicks on the Action block, causing the Right Panel to open and display its configuration fields. User visually "fills in" mock details relevant to the action (e.g., for NODIT MCP, sees fields for `Library ID`, `Function Name`, `Parameters`). User clicks "Save."
7.  **Add Conditional Logic (Optional):** User drags a "Conditional" block, connects it, and visually sees options for defining conditions in the Right Panel.
8.  **Visualize Flow:** The user can pan and zoom the canvas to view their constructed workflow.

---

### 5. Page/Screen Planning (Product Designer Focus)

**5.1. Project Canvas Page (`app/(mainapp)/project/page.tsx`)**

*   **Purpose:** The central hub for creating, editing, and visualizing automation workflows.
*   **URL:** `/project`
*   **Components:**
    *   **Root Layout:** Utilizes Shadcn UI's `ResizablePanelGroup` with `direction="horizontal"` to establish the three-column layout.
        *   `ResizablePanel` (Left Panel): `defaultSize={20}`, `minSize={15}`
        *   `ResizableHandle`
        *   `ResizablePanel` (Middle Canvas): `defaultSize={60}`, `minSize={40}`
        *   `ResizableHandle`
        *   `ResizablePanel` (Right Panel): `defaultSize={20}`, `minSize={15}`
    *   **Left Panel (`Block Library`):**
        *   **Content:**
            *   Placeholder search input (`Input` component).
            *   Categorized lists of blocks. Each category (e.g., "Triggers," "Actions," "Logic") could be implemented using Shadcn UI's `Accordion` or simple `div`s with clear headings.
            *   Individual block items will be simple `div` or `Button` components with an icon (e.g., from `lucide-react`) and text label, styled to look like draggable elements.
            *   Styling: Primarily uses `bg-card`, `text-card-foreground`, and other `globals.css` variables for consistency.
        *   **Interaction:** Visual indication of draggability (e.g., subtle shadow on hover, `cursor-grab`).
    *   **Middle Area (`Workflow Canvas`):**
        *   **Content:** The `ReactFlow` component will render here.
        *   **Interaction:** Dragging blocks from the left panel onto this area, connecting nodes, selecting nodes to open the right panel.
        *   **Styling:** A distinct background color or pattern to differentiate it as the canvas.
    *   **Right Panel (`Block Configuration / Properties Panel`):**
        *   **Content:**
            *   Header with block title.
            *   Dynamic form fields based on the selected block. Will heavily use Shadcn UI components: `Input`, `Textarea`, `Select`, `Switch`, `Checkbox`, `Label`.
            *   Example: For a "NODIT MCP Action" block, there will be text inputs for `Nodit Library ID`, `Function Name`, and a section (e.g., `Card` or `div` with border) containing dynamic input fields for `Parameters` (e.g., key-value pair inputs that can be visually "added").
            *   Action buttons at the bottom: "Save Changes," "Delete Block" (using `Button` component).
        *   **Interaction:** Visual feedback on input focus, hover states for buttons.
        *   **Styling:** Consistent with `bg-card`, `text-card-foreground`, borders from `globals.css`.

---

### 6. Interaction & UX Details

**6.1. Drag & Drop (Block Library to Canvas):**
*   **Trigger:** Mouse down on a block in the Left Panel and drag.
*   **Immediate Client-Side Response:** The dragged block will visually "lift" (e.g., a shadow, slight scale increase) and follow the cursor. A ghost or translucent representation of the block will appear.
*   **What happens next:** When dropped on the canvas, a new node will appear (React Flow).

**6.2. Connecting Blocks (React Flow):**
*   **Trigger:** Hover over a node's connection handle, click and drag to another node's handle.
*   **Immediate Client-Side Response:** The connection line will visually follow the cursor. Handles will highlight on hover.
*   **What happens next:** A visual edge will appear connecting the two nodes.

**6.3. Selecting a Block (on Canvas):**
*   **Trigger:** Click on a node on the workflow canvas.
*   **Immediate Client-Side Response:** The selected node will visually highlight (e.g., a border, different background color). The Right Panel will immediately open (if closed) and populate with mock configuration details for that block.
*   **What happens next:** User can interact with the form fields in the Right Panel.

**6.4. Form Interaction (Right Panel):**
*   **Trigger:** Typing in an input field, selecting from a dropdown, toggling a switch.
*   **Immediate Client-Side Response:** Standard Shadcn UI feedback (e.g., input borders change on focus, dropdowns open, toggles slide).
*   **What happens next:** Visual "changes detected" indicators (e.g., a "Save" button becoming active) can be mocked.

**6.5. Responsiveness:**
*   The `ResizablePanelGroup` should handle resizing gracefully.
*   For smaller screens, the Left and Right panels will likely need to collapse or transform into modals/drawers (using Shadcn UI's `Sheet` or `Drawer` components) to maximize the canvas area. The current `Sidebar` component might be useful for inspiration on this if a separate mobile view is considered.

**6.6. Error States / Empty States (Visual Representation):**
*   **Empty Canvas:** A clear, central message on the workflow canvas guiding the user to drag blocks from the left panel (e.g., "Drag a block here to start your workflow").
*   **Placeholder Errors:** For prototype, mock error messages within the Right Panel's form fields (e.g., "Invalid API Key format") using Shadcn UI's `FormMessage` or simple red text.

---

### 7. API Design (Conceptual)

For the hackathon prototype, API interactions will be purely conceptual. No actual API endpoints will be hit. The "configuration" in the Right Panel will simply update local component state to demonstrate input handling and visual feedback.

---

### 8. Database Structure (Conceptual)

Database structure will be conceptual. There will be no persistent data storage for the prototype. Workflow configurations will be represented as in-memory React component states.

---

### 9. System Design/Architecture (Visual Prototype Focus)

**9.1. Frontend:**
*   **Framework:** Next.js
*   **UI Components:** Shadcn UI (`/components/ui` directory).
*   **Workflow Visualization:** React Flow library.
*   **Styling:** Tailwind CSS, overriding/extending with `globals.css` variables only.
*   **State Management:** React's `useState`, `useReducer`, and `useContext` for managing local UI state (e.g., selected node, form input values).

**9.2. Backend:** (Not implemented for hackathon)
*   Represented conceptually as "NODIT MCP" integration, implying future API calls.

**9.3. Data Flow (Visual):**
*   User interaction (drag, drop, configure) updates local React component state.
*   This state drives the visual rendering of the workflow on the React Flow canvas and the content of the Right Panel.

---

### 10. Technology Stack (Confirmed)

*   **Frontend Framework:** Next.js (as already established)
*   **UI Library:** Shadcn UI (components from `/components/ui`)
*   **CSS Framework:** Tailwind CSS, with custom variables and base styles defined in `globals.css`. Adherence to these styles is paramount for visual consistency.
*   **Workflow Visualization:** React Flow (for the core drag-and-drop canvas).
*   **Language:** TypeScript (implied by existing project setup).

---

This PRD outlines a clear path for building a compelling visual prototype for your hackathon. The emphasis is on utilizing Next.js, Shadcn UI, and React Flow to create an intuitive and professional-looking automation builder, even without a live backend.