drop table if exists location;

create table locations (
  id serial primary key,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  query varchar(255),
  formatted_query varchar(255)
);

