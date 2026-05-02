create database if not exists habitquest;

use habitquest;

--table 1: users
create table if not exists users (
    id int auto_increment primary key,
    username varchar(50) not null unique,
    email varchar(100) not null unique,
    password_hash varchar(255) not null,
    xp int default 0,

    level int default 1,
    current_streak int 0,
    longest_streak int 0,

    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
);

--table 2: habits
create table if not exists habits (
    id int auto_increment primary key,
    user_id int not null,
    name varchar(100) not null,
    description varchar(255),

    color varchar(7) default '#7c3aed',
    daily_goal int default 1,
    sort_order int default 0,

    is_active boolean default true,
    created_at timestamp default current_timestamp,

    foreign key (user_id) references users(id) on delete cascade
);

--table 3: habit entries
create table if not exists habit_entries (
    id bigint auto_increment primary key,
    habit_id int not null,
    user_id int null,

    entry_date date not null,

    completed boolean default false,
    value int default 0,

    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,

    foreign key (habit_id) references habits(id) on delete cascade,
    foreign key (user_id) references users(id) on delete cascade,

    unique key unique_habit_per_day (habit_id, entry_date)
);

--table 4: badges
create table if not exists badges (
    id int auto_increment primary key,
    name varchar(100) not null,
    decription varchar(255),
    icon varchar(10),
    xp_reward int default 50,

    requirement_type enum('streak', 'total', 'perfect_day', 'level') not null,

    requirement_value int not null
);

--table 5: user badges
create table if not exists user_badges (
    user_id int not null,
    badge_id int not null,
    
    earned_at timestamp default current_timestamp,

    primary key (user_id, badge_id),
    
    foreign key (user_id) references users(id) on delete cascade,
    foreign key (badge_id) references badges(id) on delete cascade
);