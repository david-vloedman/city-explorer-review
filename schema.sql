
drop table if exists weather;
drop table if exists locations;


create table locations (
  id serial primary key,
  latitude numeric(10, 7),
  longitude numeric(10, 7),  
  formatted_address varchar(255)
);

create table weather (
  id serial primary key,
  summary text,
  for_date varchar(255),
  created_date bigint,
  location_id integer not null,
  foreign key (location_id) references locations (id)
);

