-- Database: Project 4 - car prices 

-- DROP DATABASE IF EXISTS "Project 4 - car prices ";

CREATE DATABASE "Project 4 - car prices "
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- Table: public.simple_cars

-- DROP TABLE IF EXISTS public.simple_cars;

CREATE TABLE IF NOT EXISTS public.simple_cars
(
    index integer NOT NULL,
    make character varying(30) COLLATE pg_catalog."default",
    model character varying(30) COLLATE pg_catalog."default",
    year integer,
    mileage integer,
    condition character varying(30) COLLATE pg_catalog."default",
    price numeric,
    CONSTRAINT "CarPricesPrediction_pkey" PRIMARY KEY (index)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.simple_cars
    OWNER to postgres;

-- Table: public.the_used_cars

-- DROP TABLE IF EXISTS public.the_used_cars;

CREATE TABLE IF NOT EXISTS public.the_used_cars
(
    index integer NOT NULL,
    year_made integer,
    fuel_type character varying(30) COLLATE pg_catalog."default",
    seats integer,
    mileage integer,
    ownership integer,
    transmission character varying(20) COLLATE pg_catalog."default",
    fuel_economy numeric,
    engine_cc numeric,
    horsepower numeric,
    torque_nm numeric,
    price numeric,
    make character varying(30) COLLATE pg_catalog."default",
    model character varying(30) COLLATE pg_catalog."default",
    CONSTRAINT the_used_cars_pkey PRIMARY KEY (index)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.the_used_cars
    OWNER to postgres;

-- Table: public.usa_cars

-- DROP TABLE IF EXISTS public.usa_cars;

CREATE TABLE IF NOT EXISTS public.usa_cars
(
    index integer NOT NULL,
    price integer,
    make character varying(30) COLLATE pg_catalog."default",
    model character varying(30) COLLATE pg_catalog."default",
    year integer,
    title_state character varying(40) COLLATE pg_catalog."default",
    mileage numeric,
    color character varying(50) COLLATE pg_catalog."default",
    vin character varying(30) COLLATE pg_catalog."default",
    state character varying(30) COLLATE pg_catalog."default",
    CONSTRAINT usa_cars_pkey PRIMARY KEY (index)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.usa_cars
    OWNER to postgres;