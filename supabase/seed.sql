insert into public.products
  (name, price, image_url, affiliate_url, asin, audience_tags, occasion_tags, price_range, description, review_quote)
values
  (
    'Pour-Over Coffee Set',
    42.00,
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ceramic%20pour%20over%20coffee%20dripper%20with%20carafe%20wooden%20table%20steam%20warm%20morning%20light%20editorial%20product%20photography&image_size=landscape_4_3',
    'https://www.amazon.com/s?k=Pour-Over+Coffee+Set',
    null,
    ARRAY['for-him','programmer'],
    ARRAY['birthday','christmas'],
    'mid',
    'Slow mornings, one cup at a time.',
    'He wanted to quit takeout coffee. This lets him make a proper cup at home.'
  ),
  (
    'Cedar and Smoke Candle',
    32.00,
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20scented%20candle%20glass%20jar%20stone%20surface%20warm%20amber%20glow%20editorial%20product%20photography&image_size=landscape_4_3',
    'https://www.amazon.com/s?k=Cedar+Smoke+Candle',
    null,
    ARRAY['for-her','for-him'],
    ARRAY['anniversary','thanks'],
    'cheap',
    'Bring a whole forest evening home.',
    'For the one who works late, the smell of cedar is a kind of safety.'
  ),
  (
    '75 Percent Mechanical Keyboard',
    139.00,
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=compact%2075%20percent%20mechanical%20keyboard%20brown%20keycaps%20wooden%20desk%20warm%20editorial%20product%20photography&image_size=landscape_4_3',
    'https://www.amazon.com/s?k=75+percent+mechanical+keyboard',
    null,
    ARRAY['for-him','programmer'],
    ARRAY['birthday'],
    'high',
    'Every word he types gets a little smoother.',
    'He types six hours a day. A good keyboard will remind him of you every time.'
  ),
  (
    'Insulated Travel Mug 16oz',
    38.00,
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=insulated%20stainless%20steel%20travel%20mug%20matte%20black%20wooden%20surface%20warm%20editorial%20product%20photography&image_size=landscape_4_3',
    'https://www.amazon.com/s?k=insulated+travel+mug+16oz',
    null,
    ARRAY['for-him','for-her'],
    ARRAY['birthday','thanks'],
    'mid',
    'Keeps coffee hot from nine to three.',
    'He forgets to drink water. Let the mug remind him instead of you.'
  ),
  (
    'Wool Blend Wrap Scarf',
    68.00,
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=folded%20wool%20blend%20wrap%20scarf%20warm%20camel%20color%20cream%20linen%20soft%20editorial%20product%20photography&image_size=landscape_4_3',
    'https://www.amazon.com/s?k=wool+blend+wrap+scarf',
    null,
    ARRAY['for-her','for-mom'],
    ARRAY['christmas','anniversary'],
    'mid',
    'The thing you throw on and forget you are wearing.',
    'The office AC is always too cold. Something to wrap up in says it without words.'
  ),
  (
    'Leather Card Wallet',
    52.00,
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=slim%20leather%20card%20wallet%20tan%20brown%20cream%20background%20editorial%20product%20photography%20soft%20shadows&image_size=landscape_4_3',
    'https://www.amazon.com/s?k=slim+leather+card+wallet',
    null,
    ARRAY['for-him','for-dad'],
    ARRAY['birthday','christmas'],
    'mid',
    'A small piece of grown-up, in your pocket.',
    'He still carries that bulky wallet. Time for something lighter.'
  ),
  (
    'Entry-Level Turntable',
    199.00,
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vinyl%20turntable%20record%20spinning%20warm%20wood%20tone%20dim%20moody%20editorial%20product%20photography&image_size=landscape_4_3',
    'https://www.amazon.com/s?k=entry+level+turntable',
    null,
    ARRAY['for-him','for-her'],
    ARRAY['birthday','anniversary'],
    'high',
    'Give loves music a shape.',
    'He collects playlists seriously. Give the music a place to live out loud.'
  ),
  (
    'Desk Plant in Ceramic Pot',
    28.00,
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=small%20desk%20plant%20ceramic%20pot%20minimal%20wooden%20desk%20warm%20soft%20light%20editorial%20product%20photography&image_size=landscape_4_3',
    'https://www.amazon.com/s?k=desk+plant+ceramic+pot',
    null,
    ARRAY['for-coworkers','for-friends'],
    ARRAY['thanks','birthday'],
    'cheap',
    'A small piece of living green, where he works.',
    'A living thing on the desk lowers stress a little. Worth it for a little.'
  ),
  (
    'Craft Beer Starter Box',
    54.00,
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=assortment%20craft%20beer%20bottles%20wooden%20table%20warm%20editorial%20product%20photography%20soft%20light&image_size=landscape_4_3',
    'https://www.amazon.com/s?k=craft+beer+starter+box',
    null,
    ARRAY['for-him','for-friends'],
    ARRAY['birthday','thanks'],
    'mid',
    'Six bottles, six new ways to do the weekend.',
    'He kept saying he would try craft beer and never did. You do it for him.'
  ),
  (
    'Wool Knit Cardigan',
    98.00,
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=folded%20wool%20knit%20cardigan%20oatmeal%20color%20cream%20linen%20soft%20editorial%20product%20photography&image_size=landscape_4_3',
    'https://www.amazon.com/s?k=wool+knit+cardigan+oatmeal',
    null,
    ARRAY['for-him','for-her'],
    ARRAY['christmas','birthday'],
    'high',
    'The thing he grabs on the way out, all winter.',
    'He is not picky about clothes, but a soft cardigan he will actually wear.'
  );
