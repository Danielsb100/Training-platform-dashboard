const AVA_FAMILIES = {
    "security": {
        title: "Security, Border & Migration",
        description: "Contemporary security demands for rapid and coordinated responses grounded in strategic analysis and research. Through modern methodologies and specialized training, AVA supports institutions, organisations and individuals in increasing their capacity to prevent and counter emerging threats, including trafficking of human beings, while facilitating legal crossing of goods and persons. Innovation, preparedness and continuous developments are the foundations of effective and efficient security systems."
    },
    "justice": {
        title: "Justice & Human Rights",
        description: "Justice constitutes the fundamental bulwark of civilization, individual freedoms and the rule of law. The protection of human and digital rights is an essential component of a modern and effective justice system. AVA supports institutions, organisations and individuals in developing competences and skills to strengthening the rule of law, safeguarding fundamental rights in both physical and digital environments. "
    },
    "education": {
        title: "Education",
        description: "Education represents a fundamental pillar for institutional strengthening and professional growth. Through targeted programs, specialized training paths, and innovative methodologies, AVA promotes the transfer of technical and operational competencies at both national and international levels. Investing in knowledge means building long-term capacity and improving the quality of responses to contemporary challenges."
    },
    "social": {
        title: "Social & Economic Development",
        description: "Social and economic development requires structured interventions, strong partnerships, and a sustainability-oriented vision. AVA supports institutions, local communities, organisations and individuals to strengthen their capacity in developing and implementing initiatives and projects to generate tangible medium- and long-term impact. Training on Theory of Change, Monitoring and Evaluation are integral part of an integrated development approach."
    },
    "innovation": {
        title: "Innovation & Technology",
        description: "Technological innovation is now a central element in the management of security, investigative analysis, and international cooperation. Through digital platforms, data intelligence tools, and integrated systems, Agenfor develops solutions designed to support institutions and operational authorities in complex and transnational contexts. Technology becomes a strategic instrument, serving operational effectiveness and the protection of communities."
    }
};

const AVA_PROJECTS = [
    {
        family: "security",
        project_name: "INTERCEPTED",
        project_slug: "intercepted",
        logo_file: "assets/ava/projects/security-border-migration/intercepted/logo.png",
        short_description: "INTERCEPTED aims to disrupt the digital model of trafficking in human beings by improving the digital capabilities of law enforcement and judicial authorities, focusing on online recruitment and advertisement as key points of intervention.",
        status: "Active Project",
        primary_cta_label: "Visit Official Website",
        primary_cta_url: "https://intercepted-project.eu/",
        secondary_cta_label: "",
        secondary_cta_url: "",
        link_type: "external",
        notes: "Training route not confirmed yet. Do not show an Access Training button."
    },

    {
        family: "security",
        project_name: "PHYGITAL-OC",
        project_slug: "phygital-oc",
        logo_file: "assets/ava/projects/security-border-migration/phygital-oc/logo.png",
        short_description: "PHYGITAL-OC supports the dismantling of organised crime groups across Europe by strengthening international cooperation, information sharing and the understanding of criminal networks operating across physical and digital environments.",
        status: "Active Project",
        primary_cta_label: "Visit Official Website",
        primary_cta_url: "https://www.phygital-project.eu/",
        secondary_cta_label: "",
        secondary_cta_url: "",
        link_type: "external",
        notes: "Training route not confirmed yet. Do not show an Access Training button."
    },
    //justice & human rights
    {
        family: "justice",
        project_name: "EUROLEGALBOT",
        project_slug: "eurolegalbot",
        logo_file: "assets/ava/projects/justice human rights/eurobot.png",
        short_description: "EUROLEGALBOT delivers dedicated, structured training modules to address professional development needs, combining active learning methodologies and digital tools to support the acquisition of practical skills and theoretical knowledge.",
        status: "Active Project",
        primary_cta_label: "Visit Official Website",
        primary_cta_url: "https://ta4wb.my.canva.site/eurolegalbot",
        secondary_cta_label: "",
        secondary_cta_url: "",
        link_type: "external",
        notes: "Training route not confirmed yet. Do not show an Access Training button."
    },
    {
        family: "justice",
        project_name: "SOURCE",
        project_slug: "source",
        logo_file: "assets/ava/projects/justice human rights/source.png",
        short_description: "SOURCE promotes judicial cooperation by supporting the practical application of EU legal instruments concerning new interception and surveillance technologies in transnational investigations, creating a European network of practitioners.",
        status: "Active Project",
        primary_cta_label: "Visit Official Website",
        primary_cta_url: "https://www.agenformedia.com/project/source/",
        secondary_cta_label: "",
        secondary_cta_url: "",
        link_type: "external",
        notes: "Training route not confirmed yet. Do not show an Access Training button."
    },
    {
        family: "justice",
        project_name: "VISAR",
        project_slug: "visar",
        logo_file: "assets/ava/projects/justice human rights/visar.png",
        short_description: "VISAR strengthens cooperation among justice, law enforcement, and social services through mutual learning events and a new AI-supported search-and-response platform designed to better support victims and service providers across the EU.",
        status: "Active Project",
        primary_cta_label: "Visit Official Website",
        primary_cta_url: "https://www.agenformedia.com/project/visar/",
        secondary_cta_label: "",
        secondary_cta_url: "",
        link_type: "external",
        notes: "Training route not confirmed yet. Do not show an Access Training button."
    },
    {
        family: "justice",
        project_name: "DIGITAL RIGHTS",
        project_slug: "digitalrights",
        logo_file: "assets/ava/projects/justice human rights/digital rights.png",
        short_description: "DIGITAL RIGHTS bolsters the practical application of EU directives on procedural rights for suspects and accused persons, focusing specifically on criminal proceedings where penal law is confronted with the use of emerging technologies.",
        status: "Active Project",
        primary_cta_label: "Visit Official Website",
        primary_cta_url: "https://www.agenformedia.com/project/digital-rights/",
        secondary_cta_label: "",
        secondary_cta_url: "",
        link_type: "external",
        notes: "Training route not confirmed yet. Do not show an Access Training button."
    },
    {
        family: "justice",
        project_name: "DATA EQUALITY",
        project_slug: "dataequality",
        logo_file: "assets/ava/projects/justice human rights/data equality.png",
        short_description: "DATA EQUALITY promotes inclusive data practices by working directly with change-makers in law enforcement and civil society, ensuring that data collection and analysis support a more just, transparent, and equitable future.",
        status: "Active Project",
        primary_cta_label: "Visit Official Website",
        primary_cta_url: "https://www.data-equality.eu",
        secondary_cta_label: "",
        secondary_cta_url: "",
        link_type: "external",
        notes: "Training route not confirmed yet. Do not show an Access Training button."
    },
 //justice & human rights PAST PROJECTS
     {
        family: "justice",
        project_name: "VR-DIGIJUST",
        project_slug: "vr-digijust",
        logo_file: "assets/ava/projects/justice human rights/past projects/vr-digijust.png",
        short_description: "VR-DIGIJUST enhances the application of EU judicial cooperation instruments through an innovative training strategy that leverages digital and immersive learning tools for justice professionals handling complex digital evidence cases.",
        status: "Past Project",
        primary_cta_label: "Visit Official Website",
        primary_cta_url: "https://www.agenformedia.com/project/vr-digijust/",
        secondary_cta_label: "",
        secondary_cta_url: "",
        link_type: "external",
        notes: "Training route not confirmed yet. Do not show an Access Training button."
    },
    {
        family: "justice",
        project_name: "PRE AND POST",
        project_slug: "pre-and-post",
        logo_file: "assets/ava/projects/justice human rights/past projects/pre and post.png",
        short_description: "PRE AND POST coordinates an Italian judicial network to improve the application of alternative measures to detention during both the pre-trial phase and the execution of sentences, in alignment with European framework decisions.",
        status: "Past Project",
        primary_cta_label: "Visit Official Website",
        primary_cta_url: "https://preandposttrial-alternativejustice.eu/consorzio/",
        secondary_cta_label: "",
        secondary_cta_url: "",
        link_type: "external",
        notes: "Training route not confirmed yet. Do not show an Access Training button."
    },
    {
        family: "justice",
        project_name: "REUNION",
        project_slug: "reunion",
        logo_file: "assets/ava/projects/justice human rights/past projects/reunion.png",
        short_description: "REUNION addresses the cross-border execution of judgements involving the deprivation of liberty, improving cooperation and understanding of the complexities surrounding foreign inmates prosecuted or convicted across EU Member States.",
        status: "Past Project",
        primary_cta_label: "Visit Official Website",
        primary_cta_url: "https://www.reunionproject.eu",
        secondary_cta_label: "",
        secondary_cta_url: "",
        link_type: "external",
        notes: "Training route not confirmed yet. Do not show an Access Training button."
    },
    {
        family: "justice",
        project_name: "EUROJUSTICE",
        project_slug: "eurojustice",
        logo_file: "assets/ava/projects/justice human rights/past projects/eurojustice.png",
        short_description: "EUROJUSTICE promotes European legal culture in criminal law and human rights protection by delivering immersive training on judicial cooperation, utilizing a 3D experimental laboratory to simulate transnational case management.",
        status: "Past Project",
        primary_cta_label: "Visit Official Website",
        primary_cta_url: "https://www.agenformedia.com/project/eurojustice-pnrr/",
        secondary_cta_label: "",
        secondary_cta_url: "",
        link_type: "external",
        notes: "Training route not confirmed yet. Do not show an Access Training button."
    },
    {
        family: "justice",
        project_name: "J-CAP",
        project_slug: "j-cap",
        logo_file: "assets/ava/projects/justice human rights/past projects/j-cap.png",
        short_description: "J-CAP improves the execution of mutual recognition regarding probation measures and alternative sanctions through awareness-raising and the development of practical materials for judges, magistrates, and lawyers.",
        status: "Past Project",
        primary_cta_label: "Visit Official Website",
        primary_cta_url: "https://www.jcap-probation.eu/jcaphome.html",
        secondary_cta_label: "",
        secondary_cta_url: "",
        link_type: "external",
        notes: "Training route not confirmed yet. Do not show an Access Training button."
    },
    {
        family: "justice",
        project_name: "DIGITAL RIGHTS",
        project_slug: "digital-rights",
        logo_file: "assets/ava/projects/justice human rights/past projects/past digital rights.png",
        short_description: "DIGITAL RIGHTS promotes European legal culture in criminal law and human rights protection by delivering blended training and utilizing a 3D experimental laboratory to simulate the management of transnational cybercrime cases.",
        status: "Past Project",
        primary_cta_label: "Visit Official Website",
        primary_cta_url: "https://www.agenformedia.com/project/digital-rights-pnrr-2/",
        secondary_cta_label: "",
        secondary_cta_url: "",
        link_type: "external",
        notes: "Training route not confirmed yet. Do not show an Access Training button."
    },
    {
        family: "justice",
        project_name: "STAND UP",
        project_slug: "stand-up",
        logo_file: "assets/ava/projects/justice human rights/past projects/stand up.png",
        short_description: "STAND UP combats hate crimes and discrimination by establishing standardized reporting procedures, utilizing OSINT technologies, and providing targeted training for law enforcement, judicial authorities, and civil society.",
        status: "Past Project",
        primary_cta_label: "Visit Official Website",
        primary_cta_url: "https://stand-up-project.eu",
        secondary_cta_label: "",
        secondary_cta_url: "",
        link_type: "external",
        notes: "Training route not confirmed yet. Do not show an Access Training button."
    },
    {
        family: "justice",
        project_name: "TRUST",
        project_slug: "trust",
        logo_file: "assets/ava/projects/justice human rights/past projects/trust.png",
        short_description: "TRUST addresses the under-reporting of hate speech and crimes against Muslim women in Italy by developing a participatory dialogue between law enforcement, local authorities, and community leaders to create effective response mechanisms.",
        status: "Past Project",
        primary_cta_label: "Visit Official Website",
        primary_cta_url: "https://www.agenformedia.com/project/trust/",
        secondary_cta_label: "",
        secondary_cta_url: "",
        link_type: "external",
        notes: "Training route not confirmed yet. Do not show an Access Training button."
    },
//Education
    {
        family: "education",
        project_name: "VR-DIGIVET",
        project_slug: "vr-digivet",
        logo_file: "assets/ava/projects/education/vr-digivet.png",
        short_description: "VR-DIGIVET improves the Albanian Vocational Education and Training (VET) system by strengthening the digital skills of staff members and students through the innovative integration and use of modern digital technologies.",
        status: "Active Project",
        primary_cta_label: "Visit Official Website",
        primary_cta_url: "https://www.agenformedia.com/project/vr-digivet/",
        secondary_cta_label: "",
        secondary_cta_url: "",
        link_type: "external",
        notes: "Training route not confirmed yet. Do not show an Access Training button."
    },
//Innovation technology
  {
        family: "innovation",
        project_name: "ARIEN",
        project_slug: "arien",
        logo_file: "assets/ava/projects/innovation technology/arien.png",
        short_description: "ARIEN leverages Artificial Intelligence to combat illicit drug production and trafficking, enhancing the threat intelligence and crime detection capacities of Law Enforcement Agencies and relevant authorities across Europe.",
        status: "Active Project",
        primary_cta_label: "Visit Official Website",
        primary_cta_url: "https://arien-euproject.eu",
        secondary_cta_label: "",
        secondary_cta_url: "",
        link_type: "external",
        notes: "Training route not confirmed yet. Do not show an Access Training button."
    },
];
