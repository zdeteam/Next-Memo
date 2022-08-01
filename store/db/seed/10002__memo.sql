INSERT INTO 
  memo (
    `id`,
    `content`, 
    `creator_id`
  )
VALUES
  (
    1001,
    "#Hello
👋 Welcome to OpenFlomo.
And here is Jack's Page: [/u/102](/u/102)",
    101
  );

INSERT INTO 
  memo (
    `id`,
    `content`, 
    `creator_id`,
    `visibility`
  )
VALUES
  (
    1002,
    '#TODO
- [ ] Take more photos about **🌄 sunset**;
- [x] Clean the room;
- [x] Read *📖 The Little Prince*;
(👆 click to toggle status)', 
    101,
    'PROTECTED'
  );

INSERT INTO 
  memo (
    `id`,
    `content`, 
    `creator_id`,
    `visibility`
  )
VALUES
  (
    1003,
    'Let''s record memo from here 🤜🤛',
    101,
    'PUBLIC'
  );

INSERT INTO 
  memo (
    `id`,
    `content`, 
    `creator_id`,
    `visibility`
  )
VALUES
  (
    1004,
    '#TODO 
- [x] Take more photos about **🌄 sunset**;
- [ ] Clean the classroom;
- [ ] Watch *👦 The Boys*;
(👆 click to toggle status)
', 
    102,
    'PROTECTED'
  );

INSERT INTO 
  memo (
    `id`,
    `content`, 
    `creator_id`,
    `visibility`
  )
VALUES
  (
    1005,
    '三人行，必有我师焉！👨‍🏫', 
    102,
    'PUBLIC'
  );
