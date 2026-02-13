import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Users, Clock, Trophy, Heart, Target, ArrowRight, Check } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Dumbbell className="h-8 w-8 text-primary" />,
      title: 'Modern Equipment',
      description: 'State-of-the-art fitness equipment for all your workout needs.',
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Expert Trainers',
      description: 'Professional trainers to guide you on your fitness journey.',
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: 'Flexible Hours',
      description: 'Open 7 days a week with extended hours for your convenience.',
    },
    {
      icon: <Trophy className="h-8 w-8 text-primary" />,
      title: 'Group Classes',
      description: 'Join our motivating group fitness classes and programs.',
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: 'Wellness Focus',
      description: 'Holistic approach to health, fitness, and well-being.',
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: 'Personalized Plans',
      description: 'Customized workout plans tailored to your fitness goals.',
    },
  ];

  const benefits = [
    'Access to all gym equipment and facilities',
    'Free fitness assessment',
    'Locker and shower facilities',
    'Free Wi-Fi throughout the facility',
    'Member-only events and workshops',
    'Nutrition guidance and support',
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-linear-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Transform Your Body,
              <span className="block text-primary">Elevate Your Mind</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Join UG Gymnasium and experience the best fitness facility on campus.
              Whether you're a student, staff member, or from the public, we have the perfect plan for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="text-base">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/plans">
                <Button size="lg" variant="outline" className="text-base">
                  View Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose UG Gymnasium?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need to achieve your fitness goals in a supportive environment.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Membership Benefits
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                When you join UG Gymnasium, you're not just getting a gym membership—you're
                joining a community dedicated to health, wellness, and personal growth.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-base">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square bg-linear-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
                <Dumbbell className="h-32 w-32 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Fitness Journey?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join hundreds of students, staff, and community members who have already transformed their lives at UG Gymnasium.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-base">
                Sign Up Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="text-base bg-transparent border-2 hover:bg-primary-foreground/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Active Members</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">20+</div>
              <div className="text-muted-foreground">Group Classes</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">15+</div>
              <div className="text-muted-foreground">Expert Trainers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">7</div>
              <div className="text-muted-foreground">Days a Week</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
