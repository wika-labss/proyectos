FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ /app/

# Mismo uid que el usuario 'analdo' del servidor: así la carpeta ./datos
# queda legible y respaldable desde fuera del contenedor sin sudo.
RUN useradd -u 1000 -m acd && mkdir -p /datos && chown -R acd:acd /datos /app
USER acd

EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", \
     "--proxy-headers", "--forwarded-allow-ips", "*"]
