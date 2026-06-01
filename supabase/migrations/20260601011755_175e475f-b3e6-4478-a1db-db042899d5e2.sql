UPDATE public.cohorts SET founders_price_cents = 19700, cohort_price_cents = 29700;
ALTER TABLE public.cohorts ALTER COLUMN founders_price_cents SET DEFAULT 19700;
ALTER TABLE public.cohorts ALTER COLUMN cohort_price_cents SET DEFAULT 29700;