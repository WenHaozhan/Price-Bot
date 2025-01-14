--
-- PostgreSQL database dump
--

-- Dumped from database version 14.7
-- Dumped by pg_dump version 15.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: price_comparison; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.price_comparison AS ENUM (
    'greater than',
    'less than'
);


ALTER TYPE public.price_comparison OWNER TO postgres;

--
-- Name: requeue(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.requeue() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
	BEGIN
		IF(pg_trigger_depth() < 2) then
			INSERT INTO notification_queue SELECT 
				OLD.id, OLD.url, OLD.price, OLD.userid, CURRENT_TIMESTAMP, OLD.channelid;
		END IF;
		RETURN NULL;
	END;
$$;


ALTER FUNCTION public.requeue() OWNER TO postgres;

--
-- Name: update_queue(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_queue() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
	BEGIN
		IF (TG_OP = 'DELETE') THEN
			DELETE FROM notification_queue WHERE id=OLD.id;
			RETURN OLD;
		ELSIF (TG_OP = 'INSERT') THEN
			INSERT INTO notification_queue SELECT 
				NEW.id, NEW.url, NEW.price, NEW.userid, CURRENT_TIMESTAMP, NEW.channelid;
		ELSIF (TG_OP = 'UPDATE') THEN
			UPDATE notification_queue SET
				price = NEW.price WHERE id = New.id;
		END IF;
		RETURN NULL;
	END;
$$;


ALTER FUNCTION public.update_queue() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accepted_websites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accepted_websites (
    website character varying
);


ALTER TABLE public.accepted_websites OWNER TO postgres;

--
-- Name: notification_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_queue (
    id uuid NOT NULL,
    url character varying NOT NULL,
    price double precision NOT NULL,
    userid bigint NOT NULL,
    "time" timestamp with time zone NOT NULL,
    channelid bigint NOT NULL,
    CONSTRAINT notification_queue_price_check CHECK ((price > (0)::double precision))
);


ALTER TABLE public.notification_queue OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    userid bigint NOT NULL,
    url text NOT NULL,
    price double precision NOT NULL,
    comparison public.price_comparison NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    channelid bigint NOT NULL,
    CONSTRAINT notifications_price_check CHECK ((price > (0)::double precision))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id character(32) NOT NULL,
    time_created timestamp with time zone NOT NULL,
    time_expire timestamp with time zone NOT NULL,
    userid bigint
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: accepted_websites accepted_websites_website_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accepted_websites
    ADD CONSTRAINT accepted_websites_website_key UNIQUE (website);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: notifications deletequeue; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER deletequeue BEFORE DELETE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_queue();


--
-- Name: notification_queue requeue; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER requeue AFTER DELETE ON public.notification_queue FOR EACH ROW EXECUTE FUNCTION public.requeue();


--
-- Name: notifications updatequeue; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER updatequeue AFTER INSERT OR UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_queue();


--
-- Name: notification_queue notification_queue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_queue
    ADD CONSTRAINT notification_queue_id_fkey FOREIGN KEY (id) REFERENCES public.notifications(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

