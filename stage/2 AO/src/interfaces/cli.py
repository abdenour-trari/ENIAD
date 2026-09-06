import click
from ..agent.tools import ScraperTool
from ..agent.memory import Memory

@click.group()
def cli():
    pass

@cli.command()
def scrape():
    s = ScraperTool()
    items = s.fetch_listings()
    click.echo(f"Fetched {len(items)} offers")

@cli.command()
def list_offers():
    m = Memory()
    rows = m.list_offers()
    for r in rows:
        click.echo(f"{r[0]} {r[1]} - {r[3]}")

if __name__ == "__main__":
    cli()
