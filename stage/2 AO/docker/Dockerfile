FROM python:3.11-slim
WORKDIR /app
COPY docker/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY src /app/src
ENV PYTHONPATH=/app/src
EXPOSE 5000
CMD ["python", "-u", "src/interfaces/web_ui.py"]
