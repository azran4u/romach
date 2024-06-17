CREATE TABLE IF NOT EXISTS balls(
    id serial PRIMARY KEY,
    size numeric NOT NULL,
    weight numeric NOT NULL
);

insert into balls(size, weight) values(1, 1);
insert into balls(size, weight) values(1, 2);
insert into balls(size, weight) values(1, 3);
insert into balls(size, weight) values(2, 1);
insert into balls(size, weight) values(2, 2);
insert into balls(size, weight) values(2, 3);