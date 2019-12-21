
drop table if exists movies;
drop table if exists weather;
drop table if exists restaurant;
drop table if exists locations;


create table locations (
  id serial primary key,  
  longitude numeric(10, 7), 
  latitude numeric(10, 7),   
  formatted_query varchar(255),
  search_query varchar(255)
);

create table weather (
  id serial primary key,
  summary text,
  for_date varchar(255),
  created_date bigint,
  location_id integer not null,
  foreign key (location_id) references locations (id)
);


create table restaurant (
  id serial primary key,
  name varchar(255),
  rating decimal,  
  price varchar(255),
  rest_url text,
  image_url text,
  created_at bigint,
  location_id integer not null,
  foreign key (location_id) references locations (id)
);

CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  overview TEXT,
  average_votes REAL,
  total_votes VARCHAR(255),
  image_url TEXT,
  popularity VARCHAR(255),
  released_on VARCHAR(255),
  created_at BIGINT,
  location_id INTEGER NOT NULL,
  FOREIGN KEY (location_id) REFERENCES locations (id)
);
