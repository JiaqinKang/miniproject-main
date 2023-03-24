CREATE DATABASE foodShop;
USE foodShop;

-- create food table with id, name, number of calories
CREATE TABLE food ( id INT AUTO_INCREMENT,
                    name VARCHAR(50),
                    typicalValuePer DECIMAL(5, 2) unsigned,
                    unitOfTheTypeValue VARCHAR(10),
                    carbs decimal(5,2) unsigned,
                    fat decimal(5,2) unsigned,
                    protein decimal(5,2) unsigned,
                    salt decimal(5,2) unsigned,
                    sugar decimal(5,2) unsigned,
                    associatedUser VARCHAR(50) not null,
                    PRIMARY KEY (id)
                    );


-- insert some data to start with
INSERT INTO food (name, typicalValuePer, unitOfTheTypeValue, carbs, fat, protein, salt, sugar, associatedUser)
VALUES ('Apple', 100, 'g', 10.4, 0.2, 0.5, 0.1, 9.8,"admsdfgin");
INSERT INTO food (name, typicalValuePer, unitOfTheTypeValue, carbs, fat, protein, salt, sugar, associatedUser)
VALUES ('Banana', 100, 'g', 22.8, 0.3, 1.1, 0.1, 12.0,"adamkxmin");
INSERT INTO food (name, typicalValuePer, unitOfTheTypeValue, carbs, fat, protein, salt, sugar, associatedUser)
VALUES ('Orange', 100, 'g', 11.8, 0.1, 0.9, 0.1, 9.7,"admxjjdn");
INSERT INTO food (name, typicalValuePer, unitOfTheTypeValue, carbs, fat, protein, salt, sugar, associatedUser)
VALUES ('Pineapple', 100, 'g', 12.3, 0.2, 0.5, 0.1, 11.3,"adajxjmin");
INSERT INTO food (name, typicalValuePer, unitOfTheTypeValue, carbs, fat, protein, salt, sugar, associatedUser)
VALUES ('flour',100,'g',81,1.4,9.1,0.01,0.6,"adqqqmin");

CREATE USER 'appuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'app2027';
GRANT ALL PRIVILEGES ON foodShop.* TO 'appuser'@'localhost';


CREATE TABLE users(id int auto_increment, 
					username varchar(50) unique not null,
					firstName varchar(50)not null, 
                    lastName varchar(50)not null, 
                    password varchar(60)not null,
                    email varchar(50) unique not null,
                    apiToken varchar(50) unique, 
                    primary key (id)
                    );

