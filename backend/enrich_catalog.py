import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from trophies.models import Category, Product

bespoke = Category.objects.get(slug='customized-bespoke')
metal = Category.objects.get(slug='metal-brass')
medals = Category.objects.get(slug='medals-lanyards')
mementos = Category.objects.get(slug='mementos-souvenirs')
resin = Category.objects.get(slug='resin-3d-sculptures')

# Move bespoke items
Product.objects.filter(slug='imperial-monogram-3d-golden-r-plinth-trophy').update(category=bespoke)
Product.objects.filter(slug='centric-deal-toy-metal-letter-plaque').update(category=bespoke)

# Add metal trophies
Product.objects.update_or_create(
    slug='grand-victorious-sovereign-cup',
    defaults={
        'category': metal,
        'name': 'The Grand Victorious Sovereign Trophy Cup',
        'description': 'Towering 18-inch nickel-plated spun metal heirloom trophy cup atop an Italian marble pedestal. Features hand-carved floral fluting along the gilded handles.',
        'price': 4200.00,
        'material': 'Spun Nickel Brass and Italian Black Marble',
        'dimensions': '18.5" H x 9.0" W x 7.5" Base',
        'weight': '4.5 kg',
        'stock': 15,
        'image_url': '/uploads/golden-letter-r-monogram-trophy.png',
        'badge': 'Sovereign Metal',
        'is_featured': True
    }
)

Product.objects.update_or_create(
    slug='titanium-star-leadership-flame',
    defaults={
        'category': metal,
        'name': 'Titanium Star 24K Gold Leadership Flame',
        'description': 'A graceful spiral of satin brushed steel converging into a brilliant faceted golden star. Represents unstoppable momentum and executive leadership.',
        'price': 3400.00,
        'material': 'Brushed Steel and Gold Electroplate',
        'dimensions': '12.0" H x 5.0" W x 3.5" D',
        'weight': '2.1 kg',
        'stock': 20,
        'image_url': '/uploads/golden-letter-r-monogram-trophy.png',
        'badge': 'Executive Metal',
        'is_featured': True
    }
)

# Add medals
Product.objects.update_or_create(
    slug='imperial-heavy-cast-medallion-trio',
    defaults={
        'category': medals,
        'name': 'Imperial Olympic Heavy Cast Medallion (Set of 3)',
        'description': 'Tri-pack of Gold, Silver, and Bronze heavyweight 3-inch die-cast zinc alloy medallions with laurel wreath embossing and custom woven satin neck lanyards.',
        'price': 1250.00,
        'material': 'Die-Cast Zinc Alloy with Antique Plating',
        'dimensions': '3.0" Diameter x 4.5mm Thickness',
        'weight': '0.6 kg',
        'stock': 80,
        'image_url': '/uploads/centric-deal-toy-metal-letter-plaque.jpg',
        'badge': 'Olympic Standard',
        'is_featured': True
    }
)

# Add mementos
Product.objects.update_or_create(
    slug='american-walnut-convocation-shield',
    defaults={
        'category': mementos,
        'name': 'American Walnut Prestige Convocation Shield Plaque',
        'description': 'Solid hand-beveled American walnut board accented with a black and gold border laser-engravable brass plate. Keyhole hangers for versatile desktop or wall mounting.',
        'price': 2200.00,
        'material': 'Solid American Walnut Wood and Brass',
        'dimensions': '9.0" W x 12.0" H x 0.75" Thick',
        'weight': '1.4 kg',
        'stock': 40,
        'image_url': '/uploads/sjw001-bd7da4.png',
        'badge': 'Institutional Shield',
        'is_featured': True
    }
)

# Add resin 3D sculptures
Product.objects.update_or_create(
    slug='winged-victory-allegorical-sculpture',
    defaults={
        'category': resin,
        'name': 'Winged Victory Allegorical Sculptural Trophy',
        'description': 'Hand-cast sculptural triumph figure in cold-cast bronze and 24K gold foil highlighting. Perched on a multi-faceted obsidian composite base.',
        'price': 4800.00,
        'material': 'Cold-Cast Bronze and Gold Foil Highlighting',
        'dimensions': '14.0" H x 7.0" W x 5.0" Base',
        'weight': '3.4 kg',
        'stock': 12,
        'image_url': '/uploads/sjw003-b4ec42.png',
        'badge': 'Sculptural Masterpiece',
        'is_featured': True
    }
)

print('Catalog enriched! Categories breakdown:')
for c in Category.objects.all():
    print(f' - {c.name} ({c.slug}): {c.products.count()} products')
