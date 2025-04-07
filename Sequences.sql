CREATE SEQUENCE IF NOT EXISTS public.fraud_reports_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.transactions_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.users_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    CACHE 1;
	ALTER TABLE public.fraud_reports ALTER COLUMN id SET DEFAULT nextval('public.fraud_reports_id_seq'::regclass);
ALTER SEQUENCE public.fraud_reports_id_seq OWNED BY public.fraud_reports.id;

-- Link sequence to transactions.id
ALTER TABLE public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);
ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;

-- Link sequence to users.id
ALTER TABLE public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
