// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "About",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-projects",
          title: "Projects",
          description: "The following project pages summarise some of my research projects and provide additional materials.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-repositories",
          title: "Repositories",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "nav-publications",
          title: "Publications",
          description: "List of my publications in reversed chronological order.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-activities",
          title: "Activities",
          description: "List of my activities (including seminar talks and conference contributions) in reversed chronological order.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/activities/";
          },
        },{id: "nav-cv",
          title: "CV",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "news-first-launch-of-the-website",
          title: 'First launch of the website.',
          description: "",
          section: "News",},{id: "news-the-proset-editor-is-now-available-for-online-use",
          title: 'The PrOSET Editor is now available for online use.',
          description: "",
          section: "News",},{id: "news-more-information-on-my-projects-are-now-available-on-separate-pages-the-first-project-page-includes-a-catalogue-of-the-hasse-diagrams-of-all-posets-up-to-cardinality-7-as-supplemental-material-to-my-recent-preprint-local-symmetries-in-partially-ordered-sets",
          title: 'More information on my projects are now available on separate pages. The first...',
          description: "",
          section: "News",},{id: "news-the-proset-editor-received-an-overhaul-and-can-now-visualise-diagrams-for-partially-ordered-sets-of-any-dimension-many-new-options-are-now-available-in-version-v1-0",
          title: 'The PrOSET Editor received an overhaul and can now visualise diagrams for partially...',
          description: "",
          section: "News",},{id: "news-the-second-part-of-my-phd-research-quantization-dequantization-and-distinguished-states-has-now-been-published",
          title: 'The second part of my PhD research ‘Quantization, dequantization and distinguished states’ has...',
          description: "",
          section: "News",},{id: "news-release-of-proset-editor-version-v1-1-including-new-functions-to-create-and-optimise-diagrams-for-2-layer-posets",
          title: 'Release of PrOSET Editor version v1.1, including new functions to create and optimise...',
          description: "",
          section: "News",},{id: "news-release-of-the-latex-package-causets-version-v1-5-with-added-references-to-the-proset-editor-and-preparation-for-the-future-support-by-latexml-for-the-conversion-of-tex-files-to-xml-and-html-see-also-latexml-on-github",
          title: 'Release of the LaTeX package ‘causets’ version v1.5, with added references to the...',
          description: "",
          section: "News",},{id: "news-information-about-my-seminar-talks-and-conference-contributions-are-now-on-a-separate-page-which-includes-links-and-some-talk-materials-for-example-handout-versions-of-slides",
          title: 'Information about my seminar talks and conference contributions are now on a separate...',
          description: "",
          section: "News",},{id: "news-i-have-received-a-riemann-fellowship-to-work-with-ko-sanders-at-the-leibniz-university-hannover-through-the-riemann-center-for-geometry-and-physics",
          title: 'I have received a Riemann fellowship to work with Ko Sanders at the...',
          description: "",
          section: "News",},{id: "news-the-results-of-my-project-with-erik-tonni-are-now-available-on-the-arxiv-in-the-article-modular-hamiltonian-of-the-massive-scalar-field-on-the-half-line-a-numerical-approach",
          title: 'The results of my project with Erik Tonni are now available on the...',
          description: "",
          section: "News",},{id: "projects-modular-operator-numerics",
          title: 'Modular operator numerics',
          description: "Numeric approach to modular operators of free, massive bosons and fermions.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/modular_operator_numerics/";
            },},{id: "projects-hasse-diagrams",
          title: 'Hasse diagrams',
          description: "Tools to create and type-set diagrams of partially ordered sets and causal sets",
          section: "Projects",handler: () => {
              window.location.href = "/projects/poset_diagrams/";
            },},{id: "projects-sprinkling-and-local-structures",
          title: 'Sprinkling and local structures',
          description: "Investigation of the sprinkling process and local structures for the discretization of fields on causal sets",
          section: "Projects",handler: () => {
              window.location.href = "/projects/sprinkling_discretization/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%63%68%72%69%73%74%6F%70%68.%6D%69%6E%7A[_%61%74_]%70%6F%73%74%65%6F.%6E%65%74", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/c-minz", "_blank");
        },
      },{
        id: 'social-inspire',
        title: 'Inspire HEP',
        section: 'Socials',
        handler: () => {
          window.open("https://inspirehep.net/authors/1414160", "_blank");
        },
      },{
        id: 'social-orcid',
        title: 'ORCID',
        section: 'Socials',
        handler: () => {
          window.open("https://orcid.org/0000-0002-5429-5997", "_blank");
        },
      },{
        id: 'social-researchgate',
        title: 'ResearchGate',
        section: 'Socials',
        handler: () => {
          window.open("https://www.researchgate.net/profile/Christoph-Minz/", "_blank");
        },
      },{
        id: 'social-youtube',
        title: 'YouTube',
        section: 'Socials',
        handler: () => {
          window.open("https://youtube.com/@c-minz", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
