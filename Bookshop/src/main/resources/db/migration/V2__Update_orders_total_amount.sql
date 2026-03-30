ALTER TABLE orders
ALTER COLUMN total_amount TYPE NUMERIC(10, 2) USING total_amount::numeric,
ALTER COLUMN total_amount SET DEFAULT 0.00;