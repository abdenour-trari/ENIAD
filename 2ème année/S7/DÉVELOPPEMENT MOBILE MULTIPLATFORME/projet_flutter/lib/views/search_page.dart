import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/cities_service.dart';
import '../models/city_model.dart';
import '../providers/favorites_provider.dart';
import '../views/place_details_page.dart';

/// ================= SORT ENUM =================
enum SortOrder { none, highToLow, lowToHigh }

class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  String searchQuery = '';
  String selectedCategory = 'All';
  SortOrder sortOrder = SortOrder.none;

  List<Place> allCities = [];
  bool isLoading = true;

  final categories = [
    'All',
    'Beach',
    'Mountain',
    'City',
    'Nature',
    'Monument',
  ];

  @override
  void initState() {
    super.initState();
    _loadCities();
  }

  Future<void> _loadCities() async {
    final cities = await CitiesService.loadCities();
    setState(() {
      allCities = cities;
      isLoading = false;
    });
  }

  /// ================= FILTER + SORT =================
  List<Place> get filteredCities {
    List<Place> result = allCities.where((city) {
      final matchesSearch =
          city.name.toLowerCase().contains(searchQuery.toLowerCase());

      final matchesCategory = selectedCategory == 'All'
          ? true
          : city.category.name.toLowerCase() == selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    }).toList();

    if (sortOrder != SortOrder.none) {
      result.sort((a, b) => sortOrder == SortOrder.highToLow
          ? b.rating.compareTo(a.rating)
          : a.rating.compareTo(b.rating));
    }

    return result;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: const Color(0xFFF6F8F7),
        centerTitle: true,
        title: const Text(
          "Search a Place",
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.w900,
            fontSize: 20,
          ),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                /// SEARCH + SORT
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 10),
                  child: Row(
                    children: [
                      Expanded(
                        child: _SearchBar(
                          onChanged: (value) {
                            setState(() => searchQuery = value);
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      _SortButton(
                        sortOrder: sortOrder,
                        onChanged: (value) {
                          setState(() => sortOrder = value);
                        },
                      ),
                    ],
                  ),
                ),

                /// CATEGORY FILTER
                _CategoryFilter(
                  categories: categories,
                  selected: selectedCategory,
                  onSelected: (category) {
                    setState(() => selectedCategory = category);
                  },
                ),

                /// LIST
                Expanded(
                  child: filteredCities.isEmpty
                      ? const Center(
                          child: Text(
                            "No places found",
                            style: TextStyle(color: Colors.grey),
                          ),
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.all(20),
                          itemCount: filteredCities.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 20),
                          itemBuilder: (context, index) {
                            return _DestinationCard(
                              city: filteredCities[index],
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }
}

/// ================= SEARCH BAR =================
class _SearchBar extends StatelessWidget {
  final ValueChanged<String> onChanged;

  const _SearchBar({required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      padding: const EdgeInsets.symmetric(horizontal: 18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: TextField(
        onChanged: onChanged,
        decoration: const InputDecoration(
          icon: Icon(Icons.search, color: Color(0xFF1B5E20)),
          hintText: "Search destination...",
          border: InputBorder.none,
        ),
      ),
    );
  }
}

/// ================= CATEGORY FILTER =================
class _CategoryFilter extends StatelessWidget {
  final List<String> categories;
  final String selected;
  final ValueChanged<String> onSelected;

  const _CategoryFilter({
    required this.categories,
    required this.selected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 46,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final category = categories[index];
          final isSelected = category == selected;

          return GestureDetector(
            onTap: () => onSelected(category),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF1B5E20) : Colors.white,
                borderRadius: BorderRadius.circular(30),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 12,
                  ),
                ],
              ),
              child: Text(
                category,
                style: TextStyle(
                  color: isSelected ? Colors.white : Colors.black,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

/// ================= SORT BUTTON =================
class _SortButton extends StatelessWidget {
  final SortOrder sortOrder;
  final ValueChanged<SortOrder> onChanged;

  const _SortButton({
    required this.sortOrder,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<SortOrder>(
      onSelected: onChanged,
      itemBuilder: (context) => const [
        PopupMenuItem(
          value: SortOrder.highToLow,
          child: Row(
            children: [
              Icon(Icons.arrow_downward, size: 18),
              SizedBox(width: 8),
              Text("Rating: High → Low"),
            ],
          ),
        ),
        PopupMenuItem(
          value: SortOrder.lowToHigh,
          child: Row(
            children: [
              Icon(Icons.arrow_upward, size: 18),
              SizedBox(width: 8),
              Text("Rating: Low → High"),
            ],
          ),
        ),
      ],
      child: Container(
        height: 52,
        width: 52,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Icon(
          Icons.sort,
          color: sortOrder == SortOrder.none
              ? Colors.grey
              : const Color(0xFF1B5E20),
        ),
      ),
    );
  }
}

/// ================= DESTINATION CARD =================
class _DestinationCard extends StatelessWidget {
  final Place city;

  const _DestinationCard({required this.city});

  @override
  Widget build(BuildContext context) {
    final favoritesProvider = context.watch<FavoritesProvider>();
    final isFavorite = favoritesProvider.isFavorite(city);

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => PlaceDetailsPage(place: city),
          ),
        );
      },
      child: Container(
        height: 180,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(26),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.18),
              blurRadius: 25,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(26),
          child: Stack(
            children: [
              Positioned.fill(
                child: Image.asset(
                  city.images.first,
                  fit: BoxFit.cover,
                ),
              ),
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.black.withOpacity(0.75),
                        Colors.transparent,
                      ],
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 14,
                right: 14,
                child: GestureDetector(
                  onTap: () {
                    favoritesProvider.toggleFavorite(city);
                  },
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.95),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      isFavorite ? Icons.favorite : Icons.favorite_border,
                      size: 18,
                      color: Colors.redAccent,
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 14,
                left: 14,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.6),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.star, size: 14, color: Colors.amber),
                      const SizedBox(width: 4),
                      Text(
                        city.rating.toString(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Positioned(
                left: 20,
                bottom: 20,
                right: 20,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      city.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      city.description,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
