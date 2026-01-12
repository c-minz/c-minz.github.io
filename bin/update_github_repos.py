#!/usr/bin/env python

import os
import sys
import requests
import yaml
from datetime import datetime

repos_filename: str = "_data/repositories.yml"
output_filename: str = "_data/github_repos.yml"


def fetch_github_repo_data(repo_full_name: str) -> dict:
    """Fetch data of a single GitHub repository.
    Args:
        repo_full_name (str): Repository in the form "USER/REPO"
    Returns:
        dict: {
            "description": str | None,
            "fork": bool,
            "parent_full_name": str | None, (optional)
            "homepage": str, (optional)
            "main_language": str | None,
            "stargazers_count": int,
            "watchers_count": int,
            "subscribers_count": int,
            "forks_count": int,
            "topics": list[str],
            "languages": list[str], (optional),
            "latest_release": str | None, (optional),
            "latest_release_tag": str | None, (optional)
        }
    Raises:
        ValueError: If the repository cannot be fetched
    """
    # Fetch data:
    url: str = f"https://api.github.com/repos/{repo_full_name}"
    headers = {
        # This ensures topics are included and uses the current API version
        "Accept": "application/vnd.github+json",
    }
    # Optional: use a token to avoid rate limits
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise ValueError(
            f"{response.status_code}: {response.text}"
        )
    
    # Get main data:
    data = response.json()
    selected_data = {
        "description": data.get("description"),
        "fork": data.get("fork", False),
        "main_language": data.get("language"),
        "stargazers_count": data.get("stargazers_count", 0),
        "watchers_count": data.get("watchers_count", 0),
        "subscribers_count": data.get("subscribers_count", 0),
        "forks_count": data.get("forks_count", 0),
        "topics": data.get("topics", []),
    }
    if ("homepage" in data) and data.get("homepage"):
        selected_data["homepage"] = data.get("homepage")
    if ("parent" in data) and data.get("parent"):
        selected_data["parent_full_name"] = data.get("parent").get("full_name")
    
    # Get languages:
    url = f"https://api.github.com/repos/{repo_full_name}/languages"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        total = sum(data.values())
        selected_data["languages"] = [
            f"{language}&nbsp;({value / total * 100:.1f}%)"
            for language, value in data.items()
        ]
    
    # Get latest release:
    url = f"https://api.github.com/repos/{repo_full_name}/releases"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        if (len(data) > 0) and data[0]:
            selected_data["latest_release"] = data[0].get("name")
            selected_data["latest_release_tag"] = data[0].get("tag_name")
    
    return selected_data


def update_github_repo_data() -> None:
    """Fetch and update GitHub repository data."""
    print(f"Fetching GitHub repository data")
    today: str = datetime.now().strftime("%Y-%m-%d")
    existing_repo_data = {}

    # Check if the output file was already updated today:
    try:
        with open(output_filename, "r") as f:
            existing_repo_data = yaml.safe_load(f)
        if (
            existing_repo_data
            and "metadata" in existing_repo_data
            and "last_updated" in existing_repo_data["metadata"]
        ):
            print(f"Last updated on: {existing_repo_data['metadata']['last_updated']}")
            if existing_repo_data["metadata"]["last_updated"] == today:
                print("Citations data is already up-to-date. Skipping fetch.")
                return
    except FileNotFoundError:
        print(
            f"Warning: The file {output_filename} with previously fetched GitHub repo data was not found and will be created."
        )
    except Exception as e:
        print(
            f"Warning: Could not read existing GitHub repository data file {output_filename}. {e}"
        )

    # Load list of repos to process:
    repo_names: List[str] = []
    try:
        with open(repos_filename, "r") as f:
            repo_names = list(yaml.safe_load(f).get("github_repos", []))
    except Exception as e:
        print(
            f"Error: The list of repositories could not be loaded from {repos_filename}. {e}"
        )
        sys.exit(1)

    # Fetch output data for all GitHub repositories:
    output_data: Dict[str, Any] = {"metadata": {"last_updated": today}, "repos": {}}
    for repo in repo_names:
        try:
            output_data["repos"][repo] = fetch_github_repo_data(repo)
        except Exception as e:
            print(
                f"Warning: Could not fetch information for repository {repo}, it will be skipped. {e}"
            )

    # Compare new data with existing data
    if existing_repo_data and existing_repo_data.get("repos") == output_data["repos"]:
        print("No changes in GitHub repository data. Skipping file update.")
        return

    # Write data:
    try:
        with open(output_filename, "w") as f:
            yaml.dump(output_data, f, width=1000, sort_keys=True)
        print(f"GitHub repository data saved to {output_filename}")
    except Exception as e:
        print(
            f"Error: Could not write {output_filename}. {e}"
        )
        sys.exit(1)


if __name__ == "__main__":
    try:
        update_github_repo_data()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
