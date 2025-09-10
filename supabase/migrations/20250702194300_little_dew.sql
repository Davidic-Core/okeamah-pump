/*
  # Payment System Schema

  1. New Tables
    - `investments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `investment_type` (text)
      - `amount` (decimal)
      - `expected_return` (decimal)
      - `term_months` (integer)
      - `status` (text)
      - `payment_intent_id` (text)
      - `created_at` (timestamp)
      - `maturity_date` (timestamp)
    
    - `payment_transactions`
      - `id` (uuid, primary key)
      - `investment_id` (uuid, foreign key)
      - `stripe_payment_intent_id` (text)
      - `amount` (decimal)
      - `currency` (text)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  investment_type text NOT NULL CHECK (investment_type IN ('short-term', 'long-term', 'secure-income')),
  investment_name text NOT NULL,
  amount decimal(12,2) NOT NULL CHECK (amount > 0),
  expected_return decimal(5,2) NOT NULL CHECK (expected_return > 0),
  term_months integer NOT NULL CHECK (term_months > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'matured', 'cancelled')),
  payment_intent_id text,
  certificate_number text UNIQUE,
  created_at timestamptz DEFAULT now(),
  maturity_date timestamptz NOT NULL
);

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id uuid REFERENCES investments(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id text NOT NULL,
  amount decimal(12,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for investments
CREATE POLICY "Users can view own investments"
  ON investments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own investments"
  ON investments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments"
  ON investments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for payment transactions
CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (
    investment_id IN (
      SELECT id FROM investments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payment transactions"
  ON payment_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    investment_id IN (
      SELECT id FROM investments WHERE user_id = auth.uid()
    )
  );

-- Function to generate certificate numbers
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS text AS $$
BEGIN
  RETURN 'OKI-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 999999 + 1)::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate certificate numbers
CREATE OR REPLACE FUNCTION set_certificate_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.certificate_number IS NULL THEN
    NEW.certificate_number := generate_certificate_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_certificate_number
  BEFORE INSERT ON investments
  FOR EACH ROW
  EXECUTE FUNCTION set_certificate_number();

-- Function to update payment transaction timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();