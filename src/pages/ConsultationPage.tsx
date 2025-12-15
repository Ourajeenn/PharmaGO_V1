                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Consultation Médicale en Ligne
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
                            Consultez un médecin sans vous déplacer.
                        </p>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            E-prescription, téléconsultation vidéo, conseils personnalisés.
                        </p>
                    </div >

    {/* Circular Menu Section */ }
    < div className = "w-full bg-[#0a0a0a] rounded-3xl p-8 mb-12 overflow-hidden relative min-h-[700px] flex items-center justify-center border border-white/5 shadow-2xl" >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,rgba(0,0,0,0)_70%)]" />
                        <ConsultationMenu />
                    </div >

    {/* CTA Section */ }
    < div className = "bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8 text-center" >
                        <h2 className="text-2xl font-bold mb-4">Prêt à consulter ?</h2>
                        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                            Nos médecins sont disponibles pour vous aider. Choisissez le mode de consultation qui vous convient.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="gap-2">
                                <Video className="h-5 w-5" />
                                Consultation vidéo
                            </Button>
                            <Button size="lg" variant="outline" className="gap-2">
                                <MessageCircle className="h-5 w-5" />
                                Chat médical
                            </Button>
                        </div>
                    </div >

    {/* How it works */ }
    < div className = "mt-16" >
                        <h2 className="text-3xl font-bold text-center mb-8">Comment ça marche ?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card className="text-center">
                                <CardContent className="pt-6">
                                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                        1
                                    </div>
                                    <h3 className="font-semibold mb-2">Choisissez votre médecin</h3>
                                    <p className="text-sm text-muted-foreground">Sélectionnez un spécialiste selon vos besoins</p>
                                </CardContent>
                            </Card>
                            <Card className="text-center">
                                <CardContent className="pt-6">
                                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                        2
                                    </div>
                                    <h3 className="font-semibold mb-2">Réservez votre créneau</h3>
                                    <p className="text-sm text-muted-foreground">Choisissez l'heure qui vous convient</p>
                                </CardContent>
                            </Card>
                            <Card className="text-center">
                                <CardContent className="pt-6">
                                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                        3
                                    </div>
                                    <h3 className="font-semibold mb-2">Consultez en ligne</h3>
                                    <p className="text-sm text-muted-foreground">Vidéo ou chat, selon votre préférence</p>
                                </CardContent>
                            </Card>
                            <Card className="text-center">
                                <CardContent className="pt-6">
                                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                                        4
                                    </div>
                                    <h3 className="font-semibold mb-2">Recevez votre ordonnance</h3>
                                    <p className="text-sm text-muted-foreground">E-prescription envoyée instantanément</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div >
                </div >
            </main >

    <Footer />
        </div >
    );
};

export default ConsultationPage;
