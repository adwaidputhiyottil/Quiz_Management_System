from fpdf import FPDF
import os

class PDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 15)
        self.set_text_color(41, 128, 185)
        self.cell(0, 10, 'Python Quizmaster - Project Overview', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(128)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def chapter_title(self, title):
        self.set_font('helvetica', 'B', 14)
        self.set_text_color(44, 62, 80)
        self.cell(0, 10, title, 0, 1, 'L')
        self.ln(4)

    def chapter_body(self, body):
        self.set_font('helvetica', '', 12)
        self.set_text_color(52, 73, 94)
        self.multi_cell(0, 8, body)
        self.ln(10)

def create_pdf(filename):
    pdf = PDF()
    pdf.add_page()
    
    # Section 1: Workflow
    pdf.chapter_title('1. Project Workflow')
    workflow_text = (
        "The Python Quizmaster application follows a multi-screen event management workflow:\n\n"
        "- Dashboard (Hub): The central entry point where the Quizmaster can monitor system status and navigate to different modules.\n"
        "- Setup Phase: The Quizmaster uses 'Manage Teams' to set up participants, 'Question Bank' to curate questions, and 'Settings' to configure event rules (rounds, timers).\n"
        "- Execution Phase (Control Center): During the live event, the Quizmaster operates the Control Center to push questions, reveal answers, and award points.\n"
        "- Presentation Phase (Projector Screen): A separate browser window/screen displays the 'Projector Screen' to the audience. It reflects the live state (current question, timer, podium) in real-time based on the Quizmaster's actions."
    )
    pdf.chapter_body(workflow_text)
    
    # Section 2: Tools Used
    pdf.chapter_title('2. Tools and Technologies Used')
    tools_text = (
        "- React 19: Core frontend library for building the user interface.\n"
        "- Vite: Extremely fast build tool and development server.\n"
        "- React Router DOM: For handling client-side routing between the Dashboard, Control Center, and Projector Screen.\n"
        "- Lucide React: Providing modern, crisp vector icons for the UI.\n"
        "- Framer Motion: Used for complex animations, particularly in the Podium Ceremony and Projector Screen transitions.\n"
        "- Canvas Confetti: For celebratory visual effects when revealing winners.\n"
        "- PrismJS: Syntax highlighting for Python code snippets within quiz questions.\n"
        "- CSS/Glassmorphism: Custom CSS styling utilizing frosted-glass effects (glass-panel) and CSS variables for theming."
    )
    pdf.chapter_body(tools_text)
    
    # Section 3: Logics & Architecture
    pdf.chapter_title('3. Logics & Architecture (State Management)')
    logics_text = (
        "The core logic relies on centralized state management, enabling synchronization across different views:\n\n"
        "- Context API (QuizContext): A global state provider wraps the application. It holds the source of truth for the entire quiz event (questions, teams, current round, scores, active question).\n"
        "- Actions & Reducers: The Context exposes an 'actions' object (e.g., nextQuestion, addScore, toggleTheme) that standardizes state mutations.\n"
        "- Cross-Window Synchronization: By leveraging React Context (or LocalStorage events if spanning multiple actual windows), the Control Center's state changes instantly trigger re-renders on the Projector Screen.\n"
        "- Component Modularity: The architecture separates layout (Dashboard) from feature-specific components (QuizWaitingScreen, PodiumCeremony), keeping the codebase maintainable."
    )
    pdf.chapter_body(logics_text)
    
    pdf.output(filename)

if __name__ == '__main__':
    create_pdf('Quizmaster_Project_Overview.pdf')
    print("PDF generated successfully.")
