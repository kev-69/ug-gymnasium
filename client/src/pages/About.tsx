import { Card, CardContent } from '@/components/ui/card';
import { Target, Users, Heart, Award, Clock, Shield } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: 'Our Mission',
      description: 'To provide a world-class fitness facility that empowers the University of Ghana community to achieve their health and wellness goals.',
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: 'Our Vision',
      description: 'To be the leading campus fitness center in Ghana, promoting healthy lifestyles and academic excellence through physical wellness.',
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: 'Excellence',
      description: 'We maintain the highest standards in equipment, facilities, and service to ensure exceptional member experiences.',
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Community',
      description: 'We foster an inclusive, supportive environment where everyone feels welcome and motivated to succeed.',
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'Safety First',
      description: 'Your safety is our priority with properly maintained equipment, certified trainers, and clean facilities.',
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: 'Commitment',
      description: 'We are committed to your success with flexible hours, personalized support, and continuous improvement.',
    },
  ];

  const team = [
    {
      name: 'Dr. Kwame Mensah',
      role: 'Director',
      bio: 'PhD in Sports Science with 15+ years of experience in fitness management and athletic training.',
    },
    {
      name: 'Sarah Boateng',
      role: 'Head Trainer',
      bio: 'Certified Personal Trainer specializing in strength training and nutrition counseling.',
    },
    {
      name: 'Emmanuel Agyei',
      role: 'Fitness Coordinator',
      bio: 'Expert in group fitness and wellness programs with a passion for community health.',
    },
    {
      name: 'Abena Osei',
      role: 'Wellness Coach',
      bio: 'Holistic health specialist focused on mental and physical well-being integration.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-linear-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              About <span className="text-primary">UG Gymnasium</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              The University of Ghana's premier fitness center, dedicated to promoting health,
              wellness, and academic success through physical fitness.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Our Story</h2>
            <div className="space-y-6 text-lg text-muted-foreground">
              <p>
                Established in 2010, UG Gymnasium has been serving the University of Ghana community
                for over a decade. What started as a small fitness center with basic equipment has
                grown into a comprehensive wellness facility serving students, staff, and the wider
                community.
              </p>
              <p>
                Located at the heart of the Legon campus, our 5,000 square foot facility features
                state-of-the-art equipment, dedicated training zones, and professional trainers who
                are passionate about helping you achieve your fitness goals.
              </p>
              <p>
                We believe that physical fitness is essential to academic success and overall
                well-being. Our mission is to provide an accessible, welcoming, and motivating
                environment where everyone—regardless of fitness level—can improve their health
                and achieve their personal best.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at UG Gymnasium.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Dedicated professionals committed to your fitness journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Highlight */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Our Facilities</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Equipment & Amenities</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Cardio machines (treadmills, ellipticals, bikes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Free weights and strength training equipment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Functional training area</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Group fitness studio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Locker rooms with showers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Free Wi-Fi and charging stations</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Operating Hours</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex justify-between">
                    <span className="font-medium">Monday - Friday:</span>
                    <span>5:00 AM - 10:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Saturday:</span>
                    <span>7:00 AM - 8:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Sunday:</span>
                    <span>8:00 AM - 6:00 PM</span>
                  </li>
                  <li className="flex justify-between pt-4 border-t">
                    <span className="font-medium">Public Holidays:</span>
                    <span>8:00 AM - 4:00 PM</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
