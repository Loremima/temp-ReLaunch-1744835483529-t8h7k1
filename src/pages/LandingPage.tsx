import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Rocket, CheckCircle, ArrowRight, BarChart, Clock, Mail, Star, ChevronRight, MoveUpRight } from 'lucide-react';

// Composant SectionTitle réutilisable
const SectionTitle: React.FC<{ subtitle: string; title: string }> = ({ subtitle, title }) => (
  <div className="text-center mb-16 md:mb-20">
    <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2 block">{subtitle}</span>
    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{title}</h2>
  </div>
);

export default function LandingPage() {
  const { user } = useAuth();
  const [animatedStats, setAnimatedStats] = useState({
    revenue: 0,
    followups: 0,
    responseRate: 0
  });
  const statsRef = useRef<HTMLDivElement>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState({
    features: false,
    howItWorks: false,
    testimonials: false,
    demo: false
  });

  // Animation des vagues océaniques
  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = 160;

    let time = 0;
    const waveColors = [
      'rgba(59, 130, 246, 0.8)', // Blue-500 avec forte opacité
      'rgba(37, 99, 235, 0.75)',  // Blue-600 avec forte opacité
      'rgba(29, 78, 216, 0.7)'    // Blue-700 avec opacité élevée
    ];

    const drawWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      waveColors.forEach((color, index) => {
        const amplitude = 25 + index * 12; // Augmentation de l'amplitude des vagues
        const period = 280 + index * 60;
        const speedFactor = 0.018 + index * 0.006;
        const phase = time * speedFactor;
        const verticalOffset = index * 6;

        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x < canvas.width; x += 3) {
          const y = Math.sin(x / period + phase) * amplitude;
          const secondaryWave = Math.sin(x / (period * 0.4) + phase * 1.3) * (amplitude * 0.15);
          ctx.lineTo(x, canvas.height / 2 + y + secondaryWave + verticalOffset);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        ctx.fillStyle = color;
        ctx.fill();
      });

      time += 0.12;
      requestAnimationFrame(drawWave);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
    };

    window.addEventListener('resize', handleResize);
    drawWave();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Système d'observation pour les animations d'entrée
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -80px 0px'
    };

    const observerCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const id = target.getAttribute('data-section-id');
          if (id) {
            setIsVisible(prev => ({ ...prev, [id]: true }));
            observer.unobserve(target);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const sections = document.querySelectorAll('[data-section-id]');
    sections.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // Animation des statistiques
  useEffect(() => {
    const targetRef = statsRef.current;
    if (!targetRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const duration = 2000; // ms
            const steps = 60;
            const stepTime = duration / steps;

            let step = 0;
            const interval = setInterval(() => {
              step++;
              const progress = step / steps;
              const easeOutExpo = 1 - Math.pow(2, -10 * progress);

              setAnimatedStats({
                revenue: Math.floor(347500 * easeOutExpo),
                followups: Math.floor(12450 * easeOutExpo),
                responseRate: Math.floor(42 * easeOutExpo)
              });

              if (step >= steps) clearInterval(interval);
            }, stepTime);

            observer.unobserve(targetRef);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(targetRef);

    return () => {
      if (targetRef) {
        observer.unobserve(targetRef);
      }
    };
  }, []);

  const features = [
    {
      icon: Clock,
      title: 'Suivis Intelligents',
      description: 'Ne manquez jamais le moment idéal. Notre IA optimise chaque relance pour un impact maximal.',
    },
    {
      icon: Mail,
      title: 'Séquences Personnalisées',
      description: 'Créez des parcours d\'emails uniques qui résonnent avec vos prospects et convertissent.',
    },
    {
      icon: BarChart,
      title: 'ROI Visible',
      description: 'Visualisez clairement les revenus récupérés grâce à un suivi automatisé et efficace.',
    },
  ];

  const testimonials = [
    {
      content: "Incroyable ! ReLaunch a ramené 12k€ de deals que je pensais morts. Mon stress a diminué, mes revenus ont augmenté.",
      author: "Sophie M.",
      role: "Designer Freelance"
    },
    {
      content: "Enfin une solution simple pour gérer les suivis. Mon taux de réponse a grimpé de 40%. Essentiel pour mon agence.",
      author: "Marcus C.",
      role: "Dirigeant d'Agence"
    },
    {
      content: "Je gagne des heures chaque semaine. L'automatisation des séquences est fluide et terriblement efficace.",
      author: "David D.",
      role: "Consultant Marketing"
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-gray-800">
      {/* Navbar - Épurée et flottante */}
      <nav className="bg-white/80 backdrop-blur-lg sticky top-0 border-b border-gray-200/80 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Rocket className="h-7 w-7 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-800">
                ReLaunch
              </span>
            </div>
            <div className="flex items-center space-x-5">
              {user ? (
                <Link
                  to="/app"
                  className="group inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Tableau de bord
                  <ArrowRight className="ml-1.5 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="group inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Démarrer Gratuitement
                    <ArrowRight className="ml-1.5 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section - Impact visuel et clarté */}
        <div className="relative pt-24 pb-32 md:pt-32 md:pb-40 overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-blue-100/30">
          <div className="absolute inset-x-0 top-0 z-0 opacity-30" style={{ height: '800px', background: 'radial-gradient(circle at top center, rgba(59, 130, 246, 0.15), transparent 70%)' }}></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Transformez le silence
              <span className="block mt-1 md:mt-2 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                en contrats signés.
              </span>
            </h1>
            <p className="mt-6 md:mt-8 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              ReLaunch automatise vos relances avec intelligence pour récupérer les prospects oubliés et booster vos ventes, sans effort supplémentaire.
            </p>
            <div className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="group w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Essayer ReLaunch gratuitement
                <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Animation des vagues océaniques */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden">
            <canvas ref={waveCanvasRef} className="w-full"></canvas>
          </div>
        </div>

        {/* Stats Section - Raffinée et animée */}
        <div ref={statsRef} className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 sm:py-20 relative overflow-hidden">
          {/* Overlay pattern pour un design plus moderne */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,_#ffffff_0,_transparent_40%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,_#ffffff_0,_transparent_30%)]"></div>
          </div>

          {/* Titre de la section de statistiques */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-10">
            <h2 className="text-center text-2xl font-bold text-white">
              Des résultats mesurables et concrets
            </h2>
            <p className="text-center text-blue-100 mt-2">
              Nos clients transforment leurs prospects silencieux en revenus réguliers
            </p>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {[
                {
                  value: animatedStats.revenue,
                  label: "Revenus Récupérés",
                  unit: "€",
                  icon: () => (
                    <svg className="w-8 h-8 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  ),
                  description: "Argent récupéré des prospects non répondants"
                },
                {
                  value: animatedStats.followups,
                  label: "Relances Automatisées",
                  icon: () => (
                    <svg className="w-8 h-8 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  ),
                  description: "Emails de suivi envoyés sans intervention"
                },
                {
                  value: animatedStats.responseRate,
                  label: "Taux de Réponse Moyen",
                  unit: "%",
                  icon: () => (
                    <svg className="w-8 h-8 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ),
                  description: "Prospects qui répondent aux relances"
                }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 bg-white/10 backdrop-blur-md rounded-xl transform hover:scale-[1.02] transition-all duration-500 hover:shadow-xl border border-white/20 group relative overflow-hidden"
                >
                  {/* Effet de brillance au survol */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000 ease-in-out -translate-x-full"></div>

                  {/* Icône et données stat */}
                  <div className="flex flex-col items-center">
                    <div className="mb-3 p-3 bg-white/10 rounded-full">
                      {stat.icon()}
                    </div>

                    <p className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-1 flex items-center justify-center">
                      {new Intl.NumberFormat('fr-FR').format(stat.value)}<span className="text-2xl ml-1">{stat.unit || ''}</span>
                    </p>

                    <p className="mt-2 text-blue-100 font-medium">{stat.label}</p>

                    {/* Description supplémentaire */}
                    <p className="text-xs text-blue-200/80 mt-2">{stat.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Badge de certification de données */}
            <div className="flex justify-center mt-10">
              <div className="bg-white/10 backdrop-blur-md py-2 px-4 rounded-full inline-flex items-center gap-2 border border-white/20">
                <svg className="w-4 h-4 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-blue-100">Données vérifiées sur les 12 derniers mois</span>
              </div>
            </div>
          </div>

          {/* Petites vagues décoratives au bas de la section */}
          <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden">
            <div className="absolute inset-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-10 text-white/5 fill-current">
                <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".3"></path>
                <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
                <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* How it works - Simple et direct */}
        <div data-section-id="howItWorks" className="py-16 sm:py-24 bg-white overflow-hidden">
          <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-opacity duration-1000 ease-out ${isVisible.howItWorks ? 'opacity-100' : 'opacity-0'}`}>
            <SectionTitle subtitle="Processus" title="Comment ReLaunch transforme vos suivis" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 mt-16">
              {[ // Conversion en tableau
                { number: 1, title: "Connectez votre boîte mail", description: "Liaison sécurisée en quelques clics via OAuth. Compatible Gmail & Outlook." },
                { number: 2, title: "Identifiez les prospects", description: "Importez vos contacts ou laissez ReLaunch détecter les emails sans réponse." },
                { number: 3, title: "Lancez les séquences", description: "Activez des modèles de relance intelligents ou créez les vôtres. C'est tout !" }
              ].map((step, index) => (
                <div key={index} className="text-center transition-transform duration-700 ease-out transform" style={{ transitionDelay: `${index * 150}ms`, transform: isVisible.howItWorks ? 'translateY(0)' : 'translateY(20px)' }}>
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-xl font-semibold mx-auto mb-5 ring-4 ring-blue-50">{step.number}</div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Demo Section - Visuel attractif */}
        <div data-section-id="demo" className="py-16 sm:py-24 bg-gray-50 overflow-hidden">
          <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-opacity duration-1000 ease-out ${isVisible.demo ? 'opacity-100' : 'opacity-0'}`}>
            <SectionTitle subtitle="Visualisation" title="Voyez ReLaunch en action" />
            <div className="mt-12 relative transition-transform duration-700 ease-out transform" style={{ transform: isVisible.demo ? 'scale(1)' : 'scale(0.95)' }}>
              {/* Placeholder pour vidéo/GIF - plus élégant */}
              <div className="aspect-video rounded-xl shadow-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-black/5"></div>
                {/* Icône Play stylisée */}
                <div className="relative z-10 flex flex-col items-center text-center p-8">
                  <button aria-label="Lancer la démo" className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-blue-600 hover:bg-white transition duration-300 transform hover:scale-110 mb-4">
                    <svg className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                  </button>
                  <p className="text-gray-700 font-medium">Voir la démo (30s)</p>
                </div>
              </div>
            </div>
            <div className="mt-10 text-center">
              <Link to="/register" className="group inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Démarrez votre essai gratuit <MoveUpRight className="h-4 w-4 ml-1 transform transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section - Cartes élégantes */}
        <div data-section-id="features" className="py-16 sm:py-24 bg-white overflow-hidden">
          <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-opacity duration-1000 ease-out ${isVisible.features ? 'opacity-100' : 'opacity-0'}`}>
            <SectionTitle subtitle="Avantages Clés" title="Conçu pour récupérer chaque opportunité" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 transition-all duration-700 ease-out transform group hover:-translate-y-2 hover:shadow-blue-500/10"
                    style={{ transitionDelay: `${index * 150}ms`, opacity: isVisible.features ? 1 : 0, transform: isVisible.features ? 'translateY(0)' : 'translateY(20px)' }}
                  >
                    <div className="flex items-center mb-5">
                      <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-600 transition-colors duration-300">
                        <Icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <h3 className="ml-4 text-lg font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Testimonials - Mise en avant de la preuve sociale */}
        <div data-section-id="testimonials" className="py-16 sm:py-24 bg-gray-50 overflow-hidden">
          <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-opacity duration-1000 ease-out ${isVisible.testimonials ? 'opacity-100' : 'opacity-0'}`}>
            <SectionTitle subtitle="Retours Clients" title="Ils ont transformé leurs suivis avec ReLaunch" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-8 shadow-md border border-gray-100 transition-all duration-700 ease-out flex flex-col"
                  style={{ transitionDelay: `${index * 150}ms`, opacity: isVisible.testimonials ? 1 : 0, transform: isVisible.testimonials ? 'translateY(0)' : 'translateY(20px)' }}
                >
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current mr-0.5" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 italic mb-5 flex-grow"> "{testimonial.content}" </blockquote>
                  <div className="flex items-center mt-auto pt-4 border-t border-gray-100">
                    {/* Placeholder pour avatar si disponible */}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-semibold text-gray-900">{testimonial.author}</p>
                      <p className="text-xs text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section - Appel à l'action clair et élégant */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 py-20 md:py-28 overflow-hidden">
          {/* Effet de fond subtil */}
          <div className="absolute inset-0 mix-blend-multiply" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat"
          }}></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
              Prêt à récupérer vos prospects perdus ?
            </h2>
            <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
              Lancez votre essai gratuit de 14 jours dès maintenant et voyez la différence par vous-même.
            </p>
            <Link
              to="/register"
              className="group inline-flex items-center px-8 py-3 border-2 border-white text-base font-medium rounded-lg text-white bg-transparent hover:bg-white hover:text-blue-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Commencer l'essai gratuit
              <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="mt-8 text-sm text-blue-100 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-1.5 text-blue-300" /> Sans carte bancaire</span>
              <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-1.5 text-blue-300" /> Configuration rapide</span>
              <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-1.5 text-blue-300" /> Annulation facile</span>
            </div>
          </div>

          {/* Animation des vagues en bas de la page */}
          <div className="absolute bottom-0 left-0 w-full h-20 overflow-hidden">
            <div className="water">
              <div className="water-inner">
                <div className="water-wave water-wave-back"></div>
                <div className="water-wave water-wave-middle"></div>
                <div className="water-wave water-wave-front"></div>
              </div>
            </div>

            {/* Style pour les vagues CSS */}
            <style jsx>{`
              .water {
                height: 180px;
                width: 100%;
                position: absolute;
                bottom: 0;
                overflow: hidden;
              }
              
              .water-inner {
                height: 100%;
                width: 200%;
                margin-left: -50%;
                position: relative;
              }
              
              .water-wave {
                height: 100%;
                width: 50%;
                position: absolute;
                left: 0;
                background-repeat: repeat-x;
                background-position: center bottom;
                transform-origin: center bottom;
              }
              
              .water-wave-back {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-31.8z' fill='rgba(37, 99, 235, 0.4)'/%3E%3C/svg%3E");
                background-size: 100% 100px;
                animation: wave 15s linear infinite alternate;
              }
              
              .water-wave-middle {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-31.8z' fill='rgba(55, 48, 163, 0.45)'/%3E%3C/svg%3E");
                background-size: 80% 80px;
                animation: wave 10s -2s linear infinite;
              }
              
              .water-wave-front {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M800 56.9c-155.5 0-204.9-50-405.5-49.9-200 0-250 49.9-394.5 49.9v31.8h800v-31.8z' fill='rgba(30, 64, 175, 0.5)'/%3E%3C/svg%3E");
                background-size: 60% 60px;
                animation: wave 8s -1s linear infinite reverse;
              }
              
              @keyframes wave {
                0% {transform: translateX(0%) scaleY(1);}
                50% {transform: translateX(-25%) scaleY(0.95);}
                100% {transform: translateX(-50%) scaleY(1);}
              }
            `}</style>
          </div>
        </div>
      </main>

      {/* Footer - Simple et propre */}
      <footer className="bg-gray-100 text-gray-600 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Rocket className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-lg font-semibold text-gray-800">
                ReLaunch
              </span>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="hover:text-blue-600 transition-colors">Confidentialité</Link>
              <Link to="/terms" className="hover:text-blue-600 transition-colors">Conditions</Link>
              <Link to="/support" className="hover:text-blue-600 transition-colors">Support</Link>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-gray-500 border-t border-gray-200 pt-6">
            © {new Date().getFullYear()} ReLaunch Technologies. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}