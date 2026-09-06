from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv


GROQ_API_KEY=""


load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")