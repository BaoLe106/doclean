CREATE TABLE document_info (
  document_id uuid UNIQUE NOT NULL PRIMARY KEY,
  user_id uuid,
  email VARCHAR(255),
  is_tex_on_s3 BOOLEAN NOT NULL DEFAULT FALSE,
  is_pdf_on_s3 BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_compiled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
