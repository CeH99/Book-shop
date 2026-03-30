-- Добавляем колонку для ключа S3 (путь внутри бакета)
ALTER TABLE products ADD COLUMN image_key VARCHAR(255);