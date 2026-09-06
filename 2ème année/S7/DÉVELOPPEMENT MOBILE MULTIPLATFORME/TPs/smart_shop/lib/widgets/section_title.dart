import 'package:flutter/material.dart';

class SectionTitle extends StatelessWidget {
  final String sectionTtitle;
  const SectionTitle({super.key, required this.sectionTtitle});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(height: 25, width: 2, color: Colors.teal),
        Expanded(
          child: ListTile(
            title: Text(
              sectionTtitle,
              style: TextStyle(
                color: Colors.teal,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
