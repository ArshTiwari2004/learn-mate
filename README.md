# 🚀 LearnMate – AI-Powered Personalized Learning Copilot

> A smart, AI-driven platform that creates personalized revision plans, identifies weak areas from test data, and assists students with doubt resolution using Google Gemini, LangChain, and Vector Search.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Demo](#demo)
- [How It Works](#how-it-works)
- [Installation](#installation)
- [Usage](#usage)
- [Future Scope](#future-scope)
- [Contributors](#contributors)
- [License](#license)

---

## 🧠 Overview

**LearnMate** is a personalized AI learning assistant designed to revolutionize how students revise and master subjects. It uses test performance analysis, GPT-4 reasoning, and Retrieval-Augmented Generation (RAG) to generate smart revision plans and answer topic-based queries using a semantic search system.

---

## ✨ Features

✅ Upload your test results (CSV or manual entry)  
✅ AI detects weak topics and generates a 7-day revision plan  
✅ Ask doubts and get accurate explanations from your own notes  
✅ Semantic search powered by embeddings + Vector DB  
✅ User-friendly UI for dashboard and chat  
✅ AI memory to track what you've studied (WIP)

---

## 🛠️ Tech Stack

| Layer             | Technology                                      |
|------------------|-------------------------------------------------|
| AI/LLM            | Google Gemini, LangChain                         |
| Vector Search     | ChromaDB / Pinecone                            |
| Backend Logic     | Python, LangChain Agents & Tools               |
| File Handling     | Pandas, PyMuPDF (for PDF parsing)              |
| UI                | Streamlit (lightweight, fast prototyping)      |
| Embeddings        | OpenAI / HuggingFace Sentence Transformers     |

---

## 🏗️ Architecture

```
Student Input (CSV/Text)
        ↓
Gemini via LangChain (Analysis & Plan Generation)
        ↓
    Personalized Study Plan
        ↓
 Ask Doubts ➝ Query Embeddings ➝ ChromaDB ➝ Relevant Context ➝ Gemini Answer
```

---


## ⚙️ How It Works

### 1. Upload Performance Data
- Accepts CSV files with “Subject” and “Score” columns
- Filters weak topics (e.g., Score < 60)

### 2. GPT-4 Study Plan Generator
- Prompts GPT to create a customized 7-day plan
- Plans include tasks: reading, solving, revising

### 3. Ask Doubts (RAG Pipeline)
- Upload your notes as PDFs or text files
- Chunked, embedded, and stored in ChromaDB
- GPT retrieves relevant content → answers your queries

---

## 🚀 Installation

```bash
git clone https://github.com/yourusername/learnmate.git
cd learnmate
pip install -r requirements.txt
```

Ensure your `.env` contains:
```
GOOGLE_API_KEY=your-key-here
```

To run:

```bash
$env:PYTHONPATH="."; uvicorn app:app --reload
```

---

## 💡 Usage

- Upload a test result file or enter topics manually
- Click “Generate Plan” to view the AI-created revision plan
- Use the “Ask Doubts” feature to ask academic questions
- View your responses and daily tasks in a clean dashboard

---

## 🔮 Future Scope

- 🧠 Add LangChain memory to track user progress
- 📘 Weekly summary + flashcard generation
- 📊 Integration with Google Classroom or MS Teams
- 🗂️ AI-generated quizzes with answer explanations

---

## 👩‍💻 Contributors

- **Priyanshi Bothra** – [@priyanshibothra](https://github.com/priyanshibothra)

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.
