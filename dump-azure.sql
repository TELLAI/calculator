--
-- PostgreSQL database dump
--

\restrict 0vlCCpBBEUCZARedlkym6j8BxbWgMojltUycNvw2GjjxBHhequdmcbCj1xMIQQI

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3716714f-d2e1-47cb-aceb-9de32196bc60	66e99d1c4f4be0d4b64047ee1fb4981f0fd741df1c21bcadcf3825e78e9b81a1	2026-03-09 22:19:38.824832+00	20260303000000_initial	\N	\N	2026-03-09 22:19:38.741766+00	1
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizations (id, name, created_at) FROM stdin;
d1d69446-a965-4f60-9969-e9323f15d27e	Mosquée ElKhalil Savigny sur orge	2026-03-09 22:29:46.473
6cafdb0b-88a6-4a90-9f7b-b235c9992c1d	Mosquée UMG Gentilly	2026-03-11 07:29:17.099
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, created_at) FROM stdin;
7bca076f-b187-4220-999d-47d55a40ba0b	elkhalilmosquee+user@gmail.com	$2b$10$BQ3tc.DHenLIcqUM49WAHeiYDW2UQzpmIQBUlQPVOM7N4gs3UQqVe	2026-03-11 07:17:16.331
8f31acac-b569-4dd4-933b-9f0f63aa9e4a	elkhalilmosquee+gentillyUser@gmail.com	$2b$12$rXvfEKaJGlbzTb2.LI80tewNX4HI0K28E1hgBVKR5U8GGesJK7MfO	2026-03-11 07:32:37.381
5daef1a7-ad09-4af8-a131-a35c6d4765bb	elkhalilmosquee+gentilly@gmail.com	$2b$12$dK2RfxxiwljouI9XWMgVz.sSqwdW4lTdHDCTEBc/e5NBOcvCvDZYS	2026-03-11 07:36:52.301
27e1270d-04c6-4d79-a75d-98352741f905	elkhalilmosquee@gmail.com	$2b$12$K1/mfJTH9zYjF.yUi1TQu.7Gd5a7Mci2C8MKL.l/HY3UuwGksDTda	2026-03-09 22:29:46.591
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, user_id, organization_id, role, created_at) FROM stdin;
3235a906-43e6-4afb-b0f1-84e3e83d9e52	27e1270d-04c6-4d79-a75d-98352741f905	d1d69446-a965-4f60-9969-e9323f15d27e	admin	2026-03-09 22:29:46.617
2a32590f-dd61-4f29-9a30-37cc0a1f67fc	8f31acac-b569-4dd4-933b-9f0f63aa9e4a	6cafdb0b-88a6-4a90-9f7b-b235c9992c1d	user	2026-03-11 07:32:37.381
39185a17-7008-4a1f-9182-a7ef0461c7d3	5daef1a7-ad09-4af8-a131-a35c6d4765bb	6cafdb0b-88a6-4a90-9f7b-b235c9992c1d	admin	2026-03-11 07:36:52.301
eac4503c-ec51-4d9a-8762-c9ca8f729d58	7bca076f-b187-4220-999d-47d55a40ba0b	d1d69446-a965-4f60-9969-e9323f15d27e	user	2026-03-11 07:17:16.348
\.


--
-- Data for Name: recoltes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recoltes (id, created_at, recolte_date, organization_id, billet_100, billet_50, billet_20, billet_10, billet_5, piece_2, piece_1, piece_050, piece_020, piece_010, piece_005, piece_002, piece_001, cotisation_adherents, cheques, carte_bancaire, autres, personnes_presentes, observations) FROM stdin;
f60bde12-779d-4f0d-87d5-e27ca1c3624f	2026-03-11 09:06:06.638	2026-02-27	d1d69446-a965-4f60-9969-e9323f15d27e	0	2	7	35	25	134.78	0	0	0	0	0	0	0	0	0	1385	0	Hakim, Achraf, Hicham, Belil, Hamoumi	\N
\.


--
-- PostgreSQL database dump complete
--

\unrestrict 0vlCCpBBEUCZARedlkym6j8BxbWgMojltUycNvw2GjjxBHhequdmcbCj1xMIQQI

